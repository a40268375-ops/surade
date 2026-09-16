<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Surade.co.id</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #0f172a;
            background-color: #f8fafc;
            padding: 20px;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header-banner {
            background: linear-gradient(135deg, #007570 0%, #00a095 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .logo-container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 16px;
        }
        .logo {
            width: 48px;
            height: 48px;
            background-color: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 24px;
            color: #007570;
        }
        .brand-name {
            color: white;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: -0.5px;
        }
        .tagline {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            margin-top: 8px;
        }
        .content-section {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #1e293b;
            margin-bottom: 20px;
        }
        .greeting strong {
            color: #007570;
        }
        .message-text {
            font-size: 15px;
            color: #475569;
            margin-bottom: 24px;
            line-height: 1.7;
        }
        .otp-container {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            border-radius: 12px;
            padding: 32px;
            text-align: center;
            margin: 32px 0;
            box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.2);
        }
        .otp-label {
            color: rgba(255, 255, 255, 0.9);
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }
        .otp-code {
            color: white;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .otp-expiry {
            color: rgba(255, 255, 255, 0.85);
            font-size: 13px;
            margin-top: 12px;
        }
        .warning-box {
            background-color: #fee2e2;
            border-left: 4px solid #dc2626;
            padding: 20px;
            border-radius: 8px;
            margin: 24px 0;
        }
        .warning-title {
            color: #991b1b;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .warning-list {
            list-style: none;
            padding: 0;
        }
        .warning-list li {
            color: #7f1d1d;
            font-size: 13px;
            padding: 6px 0;
            padding-left: 24px;
            position: relative;
        }
        .warning-list li:before {
            content: "•";
            position: absolute;
            left: 8px;
            color: #dc2626;
            font-weight: bold;
        }
        .info-text {
            font-size: 14px;
            color: #64748b;
            margin-top: 24px;
            padding: 16px;
            background-color: #f1f5f9;
            border-radius: 8px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-text {
            color: #64748b;
            font-size: 13px;
            margin-bottom: 8px;
        }
        .footer-copyright {
            color: #94a3b8;
            font-size: 12px;
        }
        .footer-brand {
            color: #007570;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Header dengan Logo dan Brand -->
        <div class="header-banner">
            <div class="logo-container">
                <div class="logo">S</div>
                <div class="brand-name">Surade.co.id</div>
            </div>
            <div class="tagline">Platform UMKM Digital Kecamatan Surade</div>
        </div>
        
        <!-- Content Section -->
        <div class="content-section">
            <div class="greeting">
                Halo, <strong>{{ $userName }}</strong>! 🔒
            </div>
            
            <div class="message-text">
                Kami menerima permintaan untuk <strong>mereset password</strong> akun Surade.co.id Anda. Gunakan kode verifikasi berikut untuk melanjutkan proses reset password:
            </div>
            
            <!-- OTP Code Box -->
            <div class="otp-container">
                <div class="otp-label">🔐 Kode Reset Password</div>
                <div class="otp-code">{{ $code }}</div>
                <div class="otp-expiry">⏱️ Berlaku selama 15 menit</div>
            </div>
            
            <!-- Warning Box -->
            <div class="warning-box">
                <div class="warning-title">
                    <span>🚨</span> Peringatan Keamanan
                </div>
                <ul class="warning-list">
                    <li>Kode ini bersifat rahasia dan hanya berlaku selama <strong>15 menit</strong></li>
                    <li>Jangan bagikan kode ini kepada siapa pun, termasuk pihak yang mengaku dari Surade.co.id</li>
                    <li>Tim Surade tidak akan pernah meminta kode verifikasi melalui telepon atau media lainnya</li>
                    <li>Jika Anda mencurigai akun Anda telah diakses oleh orang lain, segera hubungi tim support kami</li>
                </ul>
            </div>
            
            <div class="info-text">
                <strong>📌 Catatan:</strong> Jika Anda tidak meminta reset password, abaikan email ini. Password akun Anda tetap aman dan tidak akan berubah.
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                Email ini dikirim secara otomatis dari sistem <span class="footer-brand">Surade.co.id</span>
            </div>
            <div class="footer-text">
                Pertanyaan? Hubungi kami di <a href="mailto:support@surade.co.id" style="color: #007570; text-decoration: none;">support@surade.co.id</a>
            </div>
            <div class="footer-copyright">
                © {{ date('Y') }} Surade.co.id - Platform UMKM Digital Kecamatan Surade. Semua hak dilindungi.
            </div>
        </div>
    </div>
</body>
</html>