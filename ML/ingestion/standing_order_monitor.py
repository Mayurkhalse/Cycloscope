from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("standing_order_monitor")

def check_standing_order_expiry(order_placed_on: datetime, max_days: int = 30, warn_days_before: int = 5) -> int:
    """
    Tracks the 1-month expiration limit for MOSDAC real-time standing orders.
    Warns when renewal is needed.
    """
    expiry_date = order_placed_on + timedelta(days=max_days)
    days_remaining = (expiry_date - datetime.utcnow()).days
    
    if days_remaining <= warn_days_before:
        logger.warning(
            f"MOSDAC standing order expires in {days_remaining} day(s)! "
            f"Please renew standing order before {expiry_date.strftime('%Y-%m-%d')}."
        )
    else:
        logger.info(f"MOSDAC standing order active. {days_remaining} days remaining.")
        
    return days_remaining
