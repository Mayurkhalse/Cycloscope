import os
import requests
from datetime import datetime, timedelta

class MosdacClient:
    """
    MOSDAC API SSO Client with 3-failed-attempt backoff protection.
    """
    def __init__(self, username: str = None, password: str = None, base_url: str = "https://mosdac.gov.in"):
        self.username = username or os.getenv("MOSDAC_USERNAME")
        self.password = password or os.getenv("MOSDAC_PASSWORD")
        self.base_url = base_url
        self.session = requests.Session()
        self.failed_attempts = 0
        self.locked_until = None

    def is_locked(self) -> bool:
        if self.locked_until and datetime.utcnow() < self.locked_until:
            return True
        return False

    def login(self):
        if self.is_locked():
            raise RuntimeError(
                f"MOSDAC account locked due to repeated failed logins until {self.locked_until}."
            )
            
        if not self.username or not self.password:
            raise ValueError("MOSDAC credentials not provided in environment variables.")
            
        resp = self.session.post(
            f"{self.base_url}/sso/login",
            data={"username": self.username, "password": self.password},
            timeout=10
        )
        
        if resp.status_code != 200:
            self.failed_attempts += 1
            if self.failed_attempts >= 3:
                self.locked_until = datetime.utcnow() + timedelta(hours=1)
                raise RuntimeError("MOSDAC login failed 3 times. Account locked for 1 hour.")
            raise RuntimeError(f"MOSDAC login failed (Status {resp.status_code}). Attempt {self.failed_attempts}/3.")
            
        self.failed_attempts = 0
        self.locked_until = None
        return resp

    def search_download_api(self, product_code: str, start_time: str, end_time: str):
        if not self.username:
            raise ValueError("MOSDAC authentication required for download API.")
        
        params = {
            "product": product_code,
            "startTime": start_time,
            "endTime": end_time
        }
        return self.session.get(f"{self.base_url}/download-api/search", params=params, timeout=15)
