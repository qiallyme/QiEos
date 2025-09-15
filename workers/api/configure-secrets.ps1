# QiEOS Worker Secrets Configuration Script
# This script helps you configure all the required secrets for the Worker

Write-Host "🚀 Configuring QiEOS Worker Secrets..." -ForegroundColor Green
Write-Host ""

# Check if wrangler is available
try {
    $wranglerVersion = wrangler --version
    Write-Host "✅ Wrangler found: $wranglerVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Wrangler not found. Please install it first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 You'll need the following secrets:" -ForegroundColor Yellow
Write-Host "1. SUPABASE_URL - Your Supabase project URL" -ForegroundColor White
Write-Host "2. SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key" -ForegroundColor White
Write-Host "3. OPENAI_API_KEY - Your OpenAI API key (optional)" -ForegroundColor White
Write-Host "4. STRIPE_SECRET_KEY - Your Stripe secret key (optional)" -ForegroundColor White
Write-Host ""

# Function to set a secret
function Set-Secret {
    param($SecretName, $Description)

    Write-Host "🔐 Setting $SecretName..." -ForegroundColor Cyan
    Write-Host "Description: $Description" -ForegroundColor Gray

    $value = Read-Host "Enter the value for $SecretName"

    if ($value -and $value.Trim() -ne "") {
        try {
            wrangler secret put $SecretName
            Write-Host "✅ $SecretName configured successfully" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed to set $SecretName" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠️  Skipping $SecretName (empty value)" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Set required secrets
Set-Secret "SUPABASE_URL" "Your Supabase project URL (e.g., https://your-project.supabase.co)"
Set-Secret "SUPABASE_SERVICE_ROLE_KEY" "Your Supabase service role key (starts with 'eyJ...')"

# Set optional secrets
$setOpenAI = Read-Host "Do you want to configure OpenAI API key? (y/n)"
if ($setOpenAI -eq "y" -or $setOpenAI -eq "Y") {
    Set-Secret "OPENAI_API_KEY" "Your OpenAI API key for AI features"
}

$setStripe = Read-Host "Do you want to configure Stripe secret key? (y/n)"
if ($setStripe -eq "y" -or $setStripe -eq "Y") {
    Set-Secret "STRIPE_SECRET_KEY" "Your Stripe secret key for payments"
}

Write-Host "🎉 Secret configuration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Test the worker: wrangler dev" -ForegroundColor White
Write-Host "2. Deploy the worker: wrangler deploy" -ForegroundColor White
Write-Host "3. Test the admin panel and client portal" -ForegroundColor White
