python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(48))" | ForEach-Object {
  $parts = $_.Split('=')
  $env:SECRET_KEY = $parts[1]
}
$env:SQLALCHEMY_DATABASE_URI = "sqlite:///questions.db"
$env:ADMIN_PASSCODE = "dev-admin-pass"

python backend\app.py
