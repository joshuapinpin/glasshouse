from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    AKAHU_USER_TOKEN: str
    AKAHU_APP_TOKEN: str

    class Config:
        env_file = ".env"

settings = Settings()