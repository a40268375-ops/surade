<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
        <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
                    <tr>
                        <td style="background:#0f766e;padding:24px 32px;">
                            <span style="color:#ffffff;font-size:20px;font-weight:bold;">Surade.co.id</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <p style="font-size:16px;color:#111827;margin:0 0 16px;">Halo {{ $userName }},</p>
                            <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 24px;">
                                Kami menerima permintaan untuk mereset password akun Surade.co.id kamu.
                                Gunakan kode verifikasi berikut untuk melanjutkan proses reset password:
                            </p>
                            <div style="text-align:center;margin:0 0 24px;">
                                <span style="display:inline-block;background:#f0fdfa;border:1px solid #0f766e;color:#0f766e;font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px 24px;border-radius:8px;">
                                    {{ $code }}
                                </span>
                            </div>
                            <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:0 0 8px;">
                                Kode ini berlaku selama <strong>15 menit</strong>. Jangan bagikan kode ini kepada siapa pun, termasuk pihak yang mengaku dari Surade.co.id.
                            </p>
                            <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:0;">
                                Kalau kamu tidak merasa meminta reset password, abaikan saja email ini — password akun kamu tetap aman.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:16px 32px;background:#f9fafb;">
                            <span style="font-size:12px;color:#9ca3af;">&copy; {{ date('Y') }} Surade.co.id</span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>