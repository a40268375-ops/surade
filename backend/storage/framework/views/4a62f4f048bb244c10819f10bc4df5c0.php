<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo e($purpose === 'reset_password' ? 'Reset Password' : 'Verifikasi Email'); ?> - Surade</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #fff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #007bff;
            margin: 0;
        }
        .otp-code {
            background-color: #007bff;
            color: white;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            border-radius: 5px;
            letter-spacing: 3px;
            margin: 20px 0;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SURADE</h1>
        </div>
        
        <p>Halo <strong><?php echo e($name); ?></strong>,</p>
        
        <?php if($purpose === 'reset_password'): ?>
            <p>Anda telah meminta untuk mereset password akun Surade Anda. Gunakan kode verifikasi berikut untuk melanjutkan proses reset password:</p>
        <?php else: ?>
            <p>Terima kasih telah mendaftar di Surade! Untuk menyelesaikan pendaftaran, silakan gunakan kode verifikasi berikut:</p>
        <?php endif; ?>
        
        <div class="otp-code">
            <?php echo e($otp); ?>

        </div>
        
        <div class="warning">
            <strong>⚠️ Penting:</strong>
            <ul>
                <li>Kode ini berlaku selama <strong>5 menit</strong></li>
                <li>Jangan bagikan kode ini kepada siapa pun</li>
                <li>Tim Surade tidak akan pernah meminta kode verifikasi Anda</li>
            </ul>
        </div>
        
        <p>Jika Anda tidak melakukan <?php echo e($purpose === 'reset_password' ? 'permintaan reset password' : 'pendaftaran'); ?> ini, abaikan email ini.</p>
        
        <div class="footer">
            <p>Email ini dikirim secara otomatis dari sistem Surade.</p>
            <p>© <?php echo e(date('Y')); ?> Surade. Semua hak dilindungi.</p>
        </div>
    </div>
</body>
</html><?php /**PATH C:\laragon\surade\backend\resources\views\emails\otp.blade.php ENDPATH**/ ?>