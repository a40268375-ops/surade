          {activeTab === "referral" && (
            <div className="db-panel referral-dashboard">
              <div className="referral-header">
                <div className="referral-header-title">
                  <h2>Program Referral</h2>
                  <p>Kelola kode referral Anda, pantau pendapatan komisi, penggunaan kode, dan riwayat transaksi.</p>
                </div>
                <div className="referral-user-badge">
                  <UserIcon size={16} />
                  <span>Halo, <strong>{user?.name || "User"}</strong></span>
                </div>
              </div>

              <div className="referral-banner">
                <div className="referral-banner-content">
                  <span className="referral-badge">🎁 Program Kemitraan & Referral</span>
                  <h3>Dapatkan Komisi 15% Dari Setiap Referral!</h3>
                  <p>Bagikan kode unik Anda kepada rekan usaha atau kerabat. Teman Anda mendapat potongan harga saat bertransaksi, dan Anda otomatis menerima komisi tunai sebesar 15%.</p>
                </div>
                <button className="btn-tarik-komisi">
                  <Wallet size={16} /> Tarik Saldo Komisi
                </button>
              </div>

              <div className="referral-stats-grid">
                {/* Card 1 */}
                <div className="ref-stat-card ref-code-card">
                  <div className="ref-stat-header">
                    <span>KODE REFERRAL SAYA</span>
                    <Gift size={18} color="#059669" />
                  </div>
                  <div className="ref-code-box">
                    <span className="code-text">{referralStats?.referral_code || user?.referral_code || "Belum Ada"}</span>
                    <button onClick={() => {
                        if (referralStats?.referral_code || user?.referral_code) {
                            navigator.clipboard.writeText(referralStats?.referral_code || user?.referral_code);
                            alert('Kode referral berhasil disalin!');
                        }
                    }}>
                      <Copy size={14} /> Salin
                    </button>
                  </div>
                  <div className="ref-code-footer">
                    <small>Bonus Teman:<br/><strong>Diskon 5%</strong></small>
                    <button className="share-link"><Share2 size={12} /> Bagikan Link</button>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="ref-stat-card">
                  <div className="ref-stat-header">
                    <span>TOTAL PENDAPATAN (KOMISI)</span>
                    <TrendingUp size={18} color="#059669" />
                  </div>
                  <div className="ref-stat-value">
                    Rp {Number(referralStats?.total_komisi_diterima || 0).toLocaleString('id-ID')}
                  </div>
                  <div className="ref-stat-status success">
                    <CheckCircle size={14} /> komisi terverifikasi
                  </div>
                  <div className="ref-stat-footer">Minimal penarikan: Rp 50.000</div>
                </div>

                {/* Card 3 */}
                <div className="ref-stat-card">
                  <div className="ref-stat-header">
                    <span>PENGGUNAAN KODE</span>
                    <Users2 size={18} color="#3b82f6" />
                  </div>
                  <div className="ref-stat-value text-dark">
                    {referralStats?.total_penggunaan || 0} Kali Dipakai
                  </div>
                  <div className="ref-stat-sub">
                    <strong>{referralStats?.total_transaksi || 0}</strong> transaksi berhasil diselesaikan
                  </div>
                  <div className="ref-stat-status-text">Status: <span className="active">Aktif</span></div>
                </div>

                {/* Card 4 */}
                <div className="ref-stat-card">
                  <div className="ref-stat-header">
                    <span>KOMISI PENDING</span>
                    <Clock size={18} color="#f59e0b" />
                  </div>
                  <div className="ref-stat-value text-orange">
                    Rp {Number((referralStats?.total_komisi || 0) - (referralStats?.total_komisi_diterima || 0)).toLocaleString('id-ID')}
                  </div>
                  <div className="ref-stat-sub">
                    Menunggu verifikasi pembayaran transaksi
                  </div>
                  <div className="ref-stat-status-text">Status: <span className="pending">Sedang Diproses</span></div>
                </div>
              </div>

              {/* 3 Langkah Mudah */}
              <div className="ref-steps-section">
                <h4><Target size={18} /> Cara Kerja Program Referral 3 Langkah Mudah</h4>
                <div className="ref-steps-grid">
                  <div className="ref-step-card">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h5>Bagikan Kode Unik</h5>
                      <p>Salin kode <strong>{referralStats?.referral_code || user?.referral_code || "KODE"}</strong> atau link pendaftaran dan bagikan ke rekan bisnis Anda.</p>
                    </div>
                  </div>
                  <div className="ref-step-card">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h5>Teman Mendaftar & Transaksi</h5>
                      <p>Pengguna mendaftar dengan kode Anda dan membeli Paket Premium dengan potongan diskon 5%.</p>
                    </div>
                  </div>
                  <div className="ref-step-card">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h5>Nikmati Komisi 15%</h5>
                      <p>Komisi tunai 15% otomatis masuk setelah pembayaran diverifikasi admin dan dapat ditarik kapan saja.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Riwayat Transaksi */}
              <div className="ref-history-section">
                <div className="ref-history-header">
                  <div>
                    <h4><FileText size={18} /> Riwayat Transaksi Kode Referral</h4>
                    <p>Daftar transaksi pengguna yang menggunakan kode referral Anda</p>
                  </div>
                  <div className="ref-history-actions">
                    <div className="search-box">
                      <Search size={14} />
                      <input type="text" placeholder="Cari ID, nama, atau layanan..." />
                    </div>
                    <select>
                      <option>Semua Status</option>
                    </select>
                  </div>
                </div>

                <div className="ref-history-table-container">
                  <table className="ref-history-table">
                    <thead>
                      <tr>
                        <th>ID TRANSAKSI</th>
                        <th>PENGGUNA / PEMBELI</th>
                        <th>LAYANAN & BISNIS</th>
                        <th>TANGGAL</th>
                        <th>TOTAL TRANSAKSI</th>
                        <th>KOMISI ANDA (15%)</th>
                        <th>STATUS</th>
                        <th>AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralStats?.riwayat_terbaru && referralStats.riwayat_terbaru.length > 0 ? (
                        referralStats.riwayat_terbaru.map((r) => (
                          <tr key={r.id}>
                            <td>{r.transaction_id || # + r.id}</td>
                            <td>{r.referred_user || '-'}</td>
                            <td>Paket Premium</td>
                            <td>{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                            <td>Rp {Number((r.discount_amount || 0) * 20).toLocaleString('id-ID')}</td> {/* dummy calculation for visual */}
                            <td>Rp {Number(r.commission_amount || 0).toLocaleString('id-ID')}</td>
                            <td><span className={"status-badge  + r.status.toLowerCase()}>{r.status}</span></td>
                            <td><button className="action-btn">Detail</button></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="empty-state-cell">
                            <div className="empty-state-content">
                              <Share2 size={32} color="#94a3b8" />
                              <h5>Belum ada referral yang berhasil.</h5>
                              <p>Bagikan kode referral Anda ({referralStats?.referral_code || user?.referral_code || "KODE"}) ke rekan bisnis<br/>untuk mulai mendapatkan komisi 15% dari setiap pembelian<br/>Paket Premium.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
