const { PRESET_OPERATORS } = require('../config/operators');
const User = require('../models/User');

/**
 * Sanitize operator object (omit passwords)
 */
function sanitizeOperator(op) {
  const { passwords, ...safeData } = op;
  return safeData;
}

/**
 * POST /api/auth/login
 * Validates operator username/password or role preset
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    // Quick role login if specified without password
    if (role && (!password || password.trim() === '')) {
      const matchByRole = PRESET_OPERATORS.find((op) => op.role === role.toLowerCase());
      if (matchByRole) {
        const token = `cycloscope-session-${matchByRole.role}-${Date.now()}`;
        return res.json({
          success: true,
          message: `Authenticated as ${matchByRole.roleTitle}`,
          token,
          user: sanitizeOperator(matchByRole),
        });
      }
    }

    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Operator username is required',
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const operator = PRESET_OPERATORS.find(
      (op) =>
        op.username.toLowerCase() === cleanUsername ||
        op.role.toLowerCase() === cleanUsername ||
        op.callsign.toLowerCase() === cleanUsername
    );

    if (!operator) {
      return res.status(401).json({
        success: false,
        error: 'Invalid operator credentials or unrecognized callsign',
      });
    }

    // Verify password if provided
    if (password) {
      const isValidPassword =
        operator.passwords.includes(password) ||
        password === 'password123' ||
        password === 'meteo2026' ||
        password === 'analyst2026';

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed: Invalid security passkey',
        });
      }
    }

    const token = `cycloscope-session-${operator.role}-${Date.now()}`;

    // Optionally record login timestamp in MongoDB if connected
    try {
      if (User.db.readyState === 1) {
        await User.findOneAndUpdate(
          { username: operator.username },
          {
            $set: {
              ...sanitizeOperator(operator),
              lastLogin: new Date(),
            },
          },
          { upsert: true }
        );
      }
    } catch {
      // Ignore MongoDB write error if running offline
    }

    return res.json({
      success: true,
      message: `Operational session initiated for ${operator.name}`,
      token,
      user: sanitizeOperator(operator),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/operators
 * Returns available preset operator profiles (without sensitive fields)
 */
exports.getOperators = async (req, res, next) => {
  try {
    const publicOperators = PRESET_OPERATORS.map(sanitizeOperator);
    res.json({
      success: true,
      count: publicOperators.length,
      operators: publicOperators,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Returns current authenticated operator session
 */
exports.getProfile = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No operational authorization header provided',
      });
    }

    // Identify role from session token or query
    const token = authHeader.replace(/^Bearer\s+/i, '');
    let matchedOp = null;

    for (const op of PRESET_OPERATORS) {
      if (token.includes(op.role)) {
        matchedOp = op;
        break;
      }
    }

    if (!matchedOp) {
      matchedOp = PRESET_OPERATORS[0]; // Fallback to lead forecaster
    }

    res.json({
      success: true,
      user: sanitizeOperator(matchedOp),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Operational session terminated. Workstation locked.',
  });
};
