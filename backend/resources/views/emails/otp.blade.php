<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $otp }} adalah kode verifikasi Surade.com Anda</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b; line-height: 1.6;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
        
        @php
            $logoSrc = null;
            $logoPath = public_path('logo-surade.png');
            if (isset($message) && is_object($message) && method_exists($message, 'embed') && file_exists($logoPath)) {
                try {
                    $logoSrc = $message->embed($logoPath);
                } catch (\Throwable $e) {
                    $logoSrc = null;
                }
            }
            if (!$logoSrc && file_exists($logoPath)) {
                $logoSrc = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
            }
        @endphp

        <!-- Header Branding dengan Logo Resmi Surade -->
        <div style="margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 18px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                <tr>
                    <td style="vertical-align: middle; width: 50px;">
                        @if($logoSrc)
                            <img src="{{ $logoSrc }}" alt="Surade.com" style="width: 44px; height: 44px; border-radius: 10px; display: block; object-fit: contain;" />
                        @else
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 44px; height: 44px; background-color: #047857; border-radius: 10px; text-align: center;">
                                <tr>
                                    <td style="text-align: center; vertical-align: middle; color: #ffffff; font-size: 22px; font-weight: 900; font-family: sans-serif;">S</td>
                                </tr>
                            </table>
                        @endif
                    </td>
                    <td style="vertical-align: middle; padding-left: 12px;">
                        <div style="font-size: 22px; font-weight: 900; color: #047857; letter-spacing: -0.5px; line-height: 1.2;">
                            Surade<span style="color: #10b981;">.com</span>
                        </div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 2px; font-weight: 500;">
                            Platform Ekosistem Digital &amp; Direktori Bisnis Surade
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Greeting -->
        <p style="font-size: 16px; color: #0f172a; margin: 0 0 14px 0; font-weight: 700;">
            Hi {{ $name ?? 'Pengguna' }},
        </p>

        <!-- Intro text -->
        <p style="font-size: 14.5px; color: #334155; margin: 0 0 24px 0; line-height: 1.6;">
            @if(isset($purpose) && $purpose === 'reset_password')
                Kami mendeteksi permintaan reset kata sandi untuk akun <strong>Surade.com</strong> Anda. Silakan masukkan kode verifikasi 6-digit berikut untuk melanjutkan:
            @else
                Kami mendeteksi aktivitas pendaftaran akun di <strong>Surade.com</strong>. Silakan masukkan kode 6-digit di bawah ini untuk memverifikasi email Anda:
            @endif
        </p>

        <!-- Professional OTP Code Badges (Digit Tiles) -->
        <div style="margin: 28px 0 24px 0; text-align: center;">
            <div style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 14px;">
                🔑 KODE VERIFIKASI OTP
            </div>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto; border-collapse: separate; border-spacing: 8px;">
                <tr>
                    @foreach(str_split((string)$otp) as $digit)
                    <td style="width: 48px; height: 56px; background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; text-align: center; vertical-align: middle; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);">
                        <span style="font-size: 30px; font-weight: 900; color: #065f46; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Courier New', monospace; line-height: 56px; display: block;">{{ $digit }}</span>
                    </td>
                    @endforeach
                </tr>
            </table>
        </div>

        <!-- Expiry note -->
        <p style="font-size: 13.5px; color: #475569; margin: 0 0 24px 0; text-align: center;">
            ⏱️ Kode verifikasi ini akan kedaluwarsa dalam <strong>10 menit</strong>.
        </p>

        <!-- Sign-in Activity Card -->
        <div style="margin-bottom: 24px;">
            <p style="font-size: 13.5px; color: #334155; margin: 0 0 10px 0; font-weight: 600;">
                Rincian aktivitas permintaan verifikasi:
            </p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #475569;">
                    <tr>
                        <td style="padding: 6px 0; width: 140px; color: #64748b; font-weight: 500;">Waktu / Date</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{ $date ?? date('m/d/Y h:i:s A') }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Browser</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{ $browser ?? 'Google Chrome' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Sistem Operasi</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{ $os ?? 'Windows' }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Lokasi / Location</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{ $location ?? 'Surade, Sukabumi (Indonesia)' }}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Security notice -->
        <p style="font-size: 13px; color: #64748b; margin: 0 0 28px 0; line-height: 1.6;">
            Jika Anda tidak merasa melakukan pendaftaran atau permintaan ini, silakan <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/bantuan" style="color: #0d9488; text-decoration: underline; font-weight: 600;">laporkan di sini</a>. Jangan pernah membagikan kode OTP ini kepada siapapun demi keamanan akun Anda.
        </p>

        <!-- Sign off -->
        <div style="font-size: 14px; color: #334155; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            Terima kasih,<br>
            <strong style="color: #047857;">Tim Surade.com</strong>
        </div>

    </div>
</body>
</html>