import React, { useState } from 'react';

export default function ChonPhongStep({
  bookingInfo,
  numberOfDays,
  filteredRooms,
  availableRooms,
  roomFilters,
  roomTypes,
  selectedRooms,
  loading,
  totalAmount,
  handleFilterChange,
  resetFilters,
  toggleRoom,
  updateRoomGuests,
}) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 3;
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  const paginatedRooms = filteredRooms.slice((currentPage - 1) * roomsPerPage, currentPage * roomsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="booking-form-step">
      <div className="booking-section">
        {/* Header with date info */}
        <div className="booking-section-header">
          <h4 className="booking-section-title">
            <span className="booking-section-icon">🏨</span>
            Chọn phòng ({filteredRooms.length}/{availableRooms.length} phòng)
          </h4>
          <div className="booking-date-info">
            <div className="booking-date-badge">
              📅 {numberOfDays} {numberOfDays === 1 ? 'ngày' : 'ngày'}
            </div>
            {numberOfDays > 0 && (
              <div className="booking-date-range">
                {new Date(bookingInfo.ngayNhanPhong).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
                {' → '}
                {new Date(bookingInfo.ngayTraPhong).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="booking-filters-container">
          <div className="booking-filters-header">
            <h5 className="booking-filters-title">🔍 Bộ lọc tìm kiếm</h5>
            {(roomFilters.loaiPhong ||
              roomFilters.giaMin ||
              roomFilters.giaMax ||
              roomFilters.soNguoi ||
              roomFilters.searchTerm) && (
              <button className="booking-filters-reset" onClick={resetFilters}>
                <span>🔄</span> Xóa tất cả
              </button>
            )}
          </div>

          <div className="booking-filters-grid">
            {/* Search by room number */}
            <div className="booking-filter-item full-width">
              <label className="booking-filter-label">
                <span className="booking-filter-icon">🔢</span>
                Số phòng
              </label>
              <input
                type="text"
                name="searchTerm"
                className="booking-filter-input-large"
                placeholder="Nhập số phòng cần tìm..."
                value={roomFilters.searchTerm}
                onChange={handleFilterChange}
              />
            </div>

            {/* Room type */}
            <div className="booking-filter-item">
              <label className="booking-filter-label">
                <span className="booking-filter-icon">🏷️</span>
                Loại phòng
              </label>
              <select
                name="loaiPhong"
                className="booking-filter-select-large"
                value={roomFilters.loaiPhong}
                onChange={handleFilterChange}
              >
                <option value="">-- Tất cả loại phòng --</option>
                {roomTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacity */}
            <div className="booking-filter-item">
              <label className="booking-filter-label">
                <span className="booking-filter-icon">👥</span>
                Sức chứa
              </label>
              <select
                name="soNguoi"
                className="booking-filter-select-large"
                value={roomFilters.soNguoi}
                onChange={handleFilterChange}
              >
                <option value="">-- Số người --</option>
                <option value="1">Từ 1 người</option>
                <option value="2">Từ 2 người</option>
                <option value="3">Từ 3 người</option>
                <option value="4">Từ 4 người</option>
                <option value="5">Từ 5 người</option>
              </select>
            </div>

            {/* Price range */}
            <div className="booking-filter-item">
              <label className="booking-filter-label">
                <span className="booking-filter-icon">💰</span>
                Giá từ
              </label>
              <input
                type="number"
                name="giaMin"
                className="booking-filter-input-large"
                placeholder="0 đ"
                value={roomFilters.giaMin}
                onChange={handleFilterChange}
                min={0}
              />
            </div>

            <div className="booking-filter-item">
              <label className="booking-filter-label">
                <span className="booking-filter-icon">💰</span>
                Giá đến
              </label>
              <input
                type="number"
                name="giaMax"
                className="booking-filter-input-large"
                placeholder="Không giới hạn"
                value={roomFilters.giaMax}
                onChange={handleFilterChange}
                min={0}
              />
            </div>
          </div>

          {/* Active Filters Tags */}
          {(roomFilters.loaiPhong ||
            roomFilters.giaMin ||
            roomFilters.giaMax ||
            roomFilters.soNguoi ||
            roomFilters.searchTerm) && (
            <div className="booking-active-filters">
              <span className="booking-active-filters-label">Đang lọc:</span>
              <div className="booking-filter-tags">
                {roomFilters.searchTerm && (
                  <span className="booking-filter-tag">
                    🔢 Số phòng: <strong>{roomFilters.searchTerm}</strong>
                    <button
                      onClick={() =>
                        handleFilterChange({ target: { name: 'searchTerm', value: '' } })
                      }
                    >
                      ×
                    </button>
                  </span>
                )}
                {roomFilters.loaiPhong && (
                  <span className="booking-filter-tag">
                    🏷️ <strong>{roomFilters.loaiPhong}</strong>
                    <button
                      onClick={() =>
                        handleFilterChange({ target: { name: 'loaiPhong', value: '' } })
                      }
                    >
                      ×
                    </button>
                  </span>
                )}
                {roomFilters.soNguoi && (
                  <span className="booking-filter-tag">
                    👥 Từ <strong>{roomFilters.soNguoi}+ người</strong>
                    <button
                      onClick={() =>
                        handleFilterChange({ target: { name: 'soNguoi', value: '' } })
                      }
                    >
                      ×
                    </button>
                  </span>
                )}
                {roomFilters.giaMin && (
                  <span className="booking-filter-tag">
                    💰 Giá ≥{' '}
                    <strong>{parseFloat(roomFilters.giaMin).toLocaleString('vi-VN')}đ</strong>
                    <button
                      onClick={() =>
                        handleFilterChange({ target: { name: 'giaMin', value: '' } })
                      }
                    >
                      ×
                    </button>
                  </span>
                )}
                {roomFilters.giaMax && (
                  <span className="booking-filter-tag">
                    💰 Giá ≤{' '}
                    <strong>{parseFloat(roomFilters.giaMax).toLocaleString('vi-VN')}đ</strong>
                    <button
                      onClick={() =>
                        handleFilterChange({ target: { name: 'giaMax', value: '' } })
                      }
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="booking-loading">
            <div className="booking-loading-spinner"></div>
            <p>Đang tải danh sách phòng...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="booking-empty">
            <div className="booking-empty-icon">😕</div>
            {availableRooms.length === 0 ? (
              <>
                <p className="booking-empty-title">Không có phòng trống</p>
                <p className="booking-empty-desc">
                  Không có phòng trống trong khoảng thời gian này
                </p>
              </>
            ) : (
              <>
                <p className="booking-empty-title">Không tìm thấy kết quả</p>
                <p className="booking-empty-desc">
                  Thử điều chỉnh bộ lọc để tìm phòng phù hợp
                </p>
                <button className="btn-outline btn-sm" onClick={resetFilters}>
                  🔄 Xóa bộ lọc
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="booking-results-info">
              <span className="booking-results-count">
                Tìm thấy <strong>{filteredRooms.length}</strong> phòng
              </span>
            </div>

            {/* Room Grid with Pagination */}
            <div className="booking-room-grid">
              {paginatedRooms.map((room) => {
                const isSelected = selectedRooms.find((r) => r.maPhong === room.maPhong);
                const totalRoomPrice = room.giaMoiDem * numberOfDays;

                return (
                  <div
                    key={room.maPhong}
                    className={`booking-room-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleRoom(room.maPhong)}
                  >
                    <div className="booking-room-badge">
                      {isSelected && <span className="booking-room-check">✓</span>}
                    </div>

                    <div className="booking-room-number">{room.soPhong}</div>
                    <div className="booking-room-type">{room.tenLoaiPhong}</div>

                    <div className="booking-room-price-section">
                      <div className="booking-room-price-per-night">
                        {room.giaMoiDem?.toLocaleString('vi-VN')}đ
                        <span>/đêm</span>
                      </div>
                      {numberOfDays > 0 && (
                        <div className="booking-room-total-price">
                          = {totalRoomPrice.toLocaleString('vi-VN')}đ
                          <span className="booking-room-days-label">({numberOfDays} ngày)</span>
                        </div>
                      )}
                    </div>

                    <div className="booking-room-capacity">
                      👥 Tối đa: {room.soNguoiToiDa} người
                    </div>

                    <div className="booking-room-floor">🏢 Tầng {room.tenTang}</div>

                    {isSelected && (
                      <div
                        className="booking-room-guests"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label>Số người:</label>
                        <input
                          type="number"
                          className="booking-input"
                          min={1}
                          max={room.soNguoiToiDa}
                          value={isSelected.soNguoi}
                          onChange={(e) =>
                            updateRoomGuests(room.maPhong, parseInt(e.target.value) || 1)
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination controls - Redesigned */}
            {totalPages > 1 && (
              <div className="booking-pagination" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <button
                  className="booking-pagination-btn"
                  style={{
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    margin: '0 4px',
                    border: 'none',
                    background: currentPage === 1 ? '#f0f0f0' : '#fff',
                    color: '#888',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="Trang trước"
                >
                  &#60;
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className="booking-pagination-btn"
                    style={{
                      borderRadius: '50%',
                      width: 36,
                      height: 36,
                      margin: '0 4px',
                      border: 'none',
                      background: currentPage === i + 1 ? '#2ecc71' : '#fff',
                      color: currentPage === i + 1 ? '#fff' : '#333',
                      fontWeight: currentPage === i + 1 ? 'bold' : 'normal',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      transition: 'background 0.2s, color 0.2s',
                    }}
                    onClick={() => handlePageChange(i + 1)}
                    aria-current={currentPage === i + 1 ? 'page' : undefined}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="booking-pagination-btn"
                  style={{
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    margin: '0 4px',
                    border: 'none',
                    background: currentPage === totalPages ? '#f0f0f0' : '#fff',
                    color: '#888',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  title="Trang sau"
                >
                  &#62;
                </button>
              </div>
            )}
          </>
        )}

        {/* Summary with Auto Calculation */}
        <div className="booking-summary">
          <div className="booking-summary-header">
            <h5>📊 Tổng kết</h5>
          </div>
          <div className="booking-summary-grid">
            <div className="booking-summary-item">
              <span>Đã chọn:</span>
              <span className="booking-summary-value">{selectedRooms.length} phòng</span>
            </div>
            <div className="booking-summary-item">
              <span>Số ngày:</span>
              <span className="booking-summary-value">{numberOfDays} ngày</span>
            </div>
            {selectedRooms.length > 0 && (
              <>
                <div className="booking-summary-divider" />
                <div className="booking-summary-breakdown">
                  <h6>Chi tiết từng phòng:</h6>
                  {selectedRooms.map((sr) => {
                    const room = availableRooms.find((r) => r.maPhong === sr.maPhong);
                    if (!room) return null;
                    const roomTotal = room.giaMoiDem * numberOfDays;
                    return (
                      <div key={sr.maPhong} className="booking-summary-room">
                        <div className="booking-summary-room-info">
                          <span className="booking-summary-room-number">{room.soPhong}</span>
                          <span className="booking-summary-room-type">{room.tenLoaiPhong}</span>
                        </div>
                        <div className="booking-summary-room-calc">
                          <span>
                            {room.giaMoiDem.toLocaleString('vi-VN')}đ × {numberOfDays}
                          </span>
                          <span className="booking-summary-room-total">
                            = {roomTotal.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="booking-summary-divider" />
              </>
            )}
          </div>
          <div className="booking-summary-total">
            <span>Tổng thanh toán:</span>
            <span className="booking-summary-total-value">
              {totalAmount.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}