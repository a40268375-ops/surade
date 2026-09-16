<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $otp }} adalah kode verifikasi Surade.co.id Anda</title>
</head>
<body style="margin: 0; padding: 30px 15px; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2d3748; line-height: 1.6;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 36px 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
        
        <!-- Header Branding -->
        <div style="margin-bottom: 24px;">
            <div style="font-size: 22px; font-weight: 800; color: #047857; letter-spacing: -0.5px;">
                Surade<span style="color: #10b981;">.co.id</span>
            </div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
                Platform Ekosistem Digital & Direktori Bisnis Surade
            </div>
        </div>

        <!-- Greeting -->
        <p style="font-size: 16px; color: #1e293b; margin: 0 0 14px 0; font-weight: 600;">
            Hi {{ $name ?? 'Pengguna' }},
        </p>

        <!-- Intro text -->
        <p style="font-size: 14.5px; color: #334155; margin: 0 0 20px 0; line-height: 1.6;">
            @if(isset($purpose) && $purpose === 'reset_password')
                Kami mendeteksi permintaan reset kata sandi untuk akun Surade.co.id Anda. Silakan masukkan kode verifikasi berikut untuk melanjutkan:
            @else
                Kami mendeteksi aktivitas pendaftaran akun di <strong>Surade.co.id</strong>. Silakan masukkan kode 6-digit di bawah ini untuk memverifikasi email Anda:
            @endif
        </p>

        <!-- Large Spaced OTP Code (Like Zoom/TikTok style) -->
        <div style="margin: 28px 0 22px 0;">
            <div style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; line-height: 1;">
                {{ implode(' ', str_split((string)$otp)) }}
            </div>
        </div>

        <!-- Expiry note -->
        <p style="font-size: 13.5px; color: #475569; margin: 0 0 24px 0;">
            Kode verifikasi ini akan kedaluwarsa dalam <strong>10 menit</strong>.
        </p>

        <!-- Sign-in Activity Card -->
        <div style="margin-bottom: 24px;">
            <p style="font-size: 13.5px; color: #334155; margin: 0 0 10px 0; font-weight: 500;">
                Rincian aktivitas permintaan verifikasi:
            </p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #475569;">
                    <tr>
                        <td style="padding: 5px 0; width: 140px; color: #64748b; font-weight: 500;">Waktu / Date</td>
                        <td style="padding: 5px 0; color: #1e293b; font-weight: 600;">{{ $date ?? date('m/d/Y h:i:s A') }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; color: #64748b; font-weight: 500;">Browser</td>
                        <td style="padding: 5px 0; color: #1e293b; font-weight: 600;">{{ $browser ?? 'Chrome / Web Browser' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; color: #64748b; font-weight: 500;">Sistem Operasi</td>
                        <td style="padding: 5px 0; color: #1e293b; font-weight: 600;">{{ $os ?? 'Windows / Android' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; color: #64748b; font-weight: 500;">Lokasi / Location</td>
                        <td style="padding: 5px 0; color: #1e293b; font-weight: 600;">{{ $location ?? 'Surade, Sukabumi (Indonesia)' }}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Security notice -->
        <p style="font-size: 13px; color: #64748b; margin: 0 0 28px 0; line-height: 1.6;">
            Jika Anda tidak merasa melakukan pendaftaran atau permintaan ini, silakan <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/bantuan" style="color: #0284c7; text-decoration: underline;">laporkan di sini</a>. Jangan pernah membagikan kode OTP ini kepada siapapun demi keamanan akun Anda.
        </p>

        <!-- Sign off -->
        <div style="font-size: 14px; color: #334155; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            Terima kasih,<br>
            <strong style="color: #047857;">Tim Surade.co.id</strong>
        </div>

    </div>
</body>
</html>