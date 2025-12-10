import React, { useEffect, useState } from 'react';
import Toast from '../Common/Toast'; // ✅ IMPORT
import api from '../../utils/api';

export default function QuanLyHinhAnhLP() {
  const [loaiPhongs, setLoaiPhongs] = useState([]);
  const [selectedLoaiPhong, setSelectedLoaiPhong] = useState(null);
  const [hinhAnhs, setHinhAnhs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' }); // ✅ ĐỔI

  const showToast = (type, message) => {
    setToast({ show: true, type, message }); // ✅ ĐỔI
  };

  useEffect(() => {
    loadLoaiPhongs();
  }, []);

  useEffect(() => {
    if (selectedLoaiPhong) {
      loadHinhAnhs();
    } else {
      setHinhAnhs([]);
    }
  }, [selectedLoaiPhong]);

  const loadLoaiPhongs = async () => {
    try {
      const resp = await api.get('/api/LoaiPhong');
      const data = resp.data?.data || resp.data;
      setLoaiPhongs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Load loại phòng error:', err);
      showToast('error', 'Lỗi tải danh sách loại phòng');
    }
  };

  const loadHinhAnhs = async () => {
    setLoading(true);
    try {
      const resp = await api.get(`/api/HinhAnhLPhong/LoaiPhong/${selectedLoaiPhong.maLoaiPhong}`);
      const data = resp.data?.data || resp.data;
      setHinhAnhs(Array.isArray(data) ? data : []);
      setSelectedImages([]);
    } catch (err) {
      console.error('Load hình ảnh error:', err);
      setHinhAnhs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      showToast('error', 'Vui lòng chọn file hình ảnh!');
      return;
    }
    const previews = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadFiles((prev) => [...prev, ...previews]);
    if (!showUploadModal) setShowUploadModal(true);
  };

  const removeUploadFile = (index) => {
    setUploadFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadImages = async () => {
    if (!selectedLoaiPhong || uploadFiles.length === 0) return;

    setLoading(true);
    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        const item = uploadFiles[i];
        const formData = new FormData();
        formData.append('File', item.file);
        formData.append('MaLoaiPhong', selectedLoaiPhong.maLoaiPhong);

        await api.post('/api/HinhAnhLPhong', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      showToast('success', `Upload thành công ${uploadFiles.length} hình ảnh!`);
      setShowUploadModal(false);
      uploadFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      setUploadFiles([]);
      loadHinhAnhs();
    } catch (err) {
      console.error('Upload error:', err);
      showToast('error', err.response?.data?.message || 'Lỗi upload hình ảnh');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectImage = (id) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedImages.length === hinhAnhs.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(hinhAnhs.map((h) => h.maHinhAnh));
    }
  };

  const openDeleteConfirm = (img) => {
    setDeletingItem(img);
  };

  const deleteSelected = async () => {
    if (selectedImages.length === 0) return;

    setDeletingItem({ isMultiple: true, count: selectedImages.length });
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    setLoading(true);
    try {
      if (deletingItem.isMultiple) {
        for (const id of selectedImages) {
          await api.delete(`/api/HinhAnhLPhong/${id}`);
        }
        showToast('success', `Đã xóa ${selectedImages.length} hình ảnh!`);
      } else {
        await api.delete(`/api/HinhAnhLPhong/${deletingItem.maHinhAnh}`);
        showToast('success', 'Xóa hình ảnh thành công!');
      }
      setDeletingItem(null);
      loadHinhAnhs();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('error', 'Lỗi xóa hình ảnh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-card">
      {/* ✅ Toast Component */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ show: false, type: '', message: '' })}
          duration={3000}
        />
      )}

      {/* Header */}
      <div className="room-header">
        <div className="room-header-title">Hình ảnh loại phòng</div>
        <div className="room-header-actions">
          <select
            value={selectedLoaiPhong?.maLoaiPhong || ''}
            onChange={(e) => {
              const lp = loaiPhongs.find((l) => l.maLoaiPhong === parseInt(e.target.value));
              setSelectedLoaiPhong(lp);
            }}
            style={{
              minWidth: '250px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
            }}
          >
            <option value="">-- Chọn loại phòng --</option>
            {loaiPhongs.map((lp) => (
              <option key={lp.maLoaiPhong} value={lp.maLoaiPhong}>
                {lp.tenLoaiPhong}
              </option>
            ))}
          </select>

          {selectedLoaiPhong && (
            <>
              <button className="btn-success" onClick={() => setShowUploadModal(true)}>
                + Upload ảnh
              </button>
              {selectedImages.length > 0 && (
                <>
                  <button className="btn-outline" onClick={selectAll}>
                    {selectedImages.length === hinhAnhs.length ? 'Bỏ chọn' : 'Chọn tất cả'}
                  </button>
                  <button
                    className="btn-outline"
                    onClick={deleteSelected}
                    style={{ color: '#ef4444', borderColor: '#ef4444' }}
                  >
                    Xóa ({selectedImages.length})
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      {selectedLoaiPhong && (
        <div style={{ padding: '20px 0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
              Đang tải...
            </div>
          ) : hinhAnhs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
              <p style={{ marginBottom: '16px', fontSize: '15px' }}>Chưa có hình ảnh nào</p>
              <button className="btn-success" onClick={() => setShowUploadModal(true)}>
                + Upload ảnh đầu tiên
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '20px',
              }}
            >
              {hinhAnhs.map((img) => (
                <div
                  key={img.maHinhAnh}
                  style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#f9fafb',
                    border: selectedImages.includes(img.maHinhAnh)
                      ? '2px solid #2563eb'
                      : '2px solid #e5e7eb',
                    transition: 'all 0.3s',
                    boxShadow: selectedImages.includes(img.maHinhAnh)
                      ? '0 0 0 3px rgba(37, 99, 235, 0.1)'
                      : 'none',
                  }}
                >
                  {/* Checkbox */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 3 }}>
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(img.maHinhAnh)}
                      onChange={() => toggleSelectImage(img.maHinhAnh)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Ảnh */}
                  <img
                    src={`${api.defaults.baseURL}${img.url}`}
                    alt={`Hình ảnh ${img.tenLoaiPhong}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />

                  {/* Actions */}
                  <div style={{ padding: '12px', background: 'white' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="action-icon-btn delete"
                        onClick={() => openDeleteConfirm(img)}
                        title="Xóa"
                        style={{ flex: 1, padding: '8px', fontSize: '14px' }}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginTop: '8px',
                        textAlign: 'center',
                      }}
                    >
                      {img.tenLoaiPhong}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-header-left">
                <h3>Upload hình ảnh</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowUploadModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div
                style={{
                  border: dragActive ? '2px dashed #2563eb' : '2px dashed #d1d5db',
                  borderRadius: '12px',
                  padding: '60px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragActive ? '#eff6ff' : '#f9fafb',
                  transition: 'all 0.3s',
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
              >
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                  📁 Kéo thả ảnh vào đây hoặc click để chọn
                </p>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>

              {uploadFiles.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '16px',
                    marginTop: '20px',
                  }}
                >
                  {uploadFiles.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: 'white',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={item.preview}
                        alt="Preview"
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <div style={{ padding: '10px' }}>
                        <button
                          onClick={() => removeUploadFile(idx)}
                          style={{
                            width: '100%',
                            padding: '6px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                          }}
                        >
                          ✕ Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <div className="modal-footer-right">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    uploadFiles.forEach((f) => URL.revokeObjectURL(f.preview));
                    setUploadFiles([]);
                    setShowUploadModal(false);
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={uploadImages}
                  disabled={loading || uploadFiles.length === 0}
                >
                  {loading ? 'Đang upload...' : `Upload ${uploadFiles.length} ảnh`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {deletingItem && (
        <div className="modal-backdrop">
          <div className="modal modal-sm">
            <div className="modal-header">
              <div className="modal-header-left">
                <h3>Xóa hình ảnh</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setDeletingItem(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p>
                {deletingItem.isMultiple
                  ? `Bạn có chắc chắn muốn xóa ${deletingItem.count} hình ảnh đã chọn?`
                  : 'Bạn có chắc chắn muốn xóa hình ảnh này?'}{' '}
                Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="modal-footer">
              <div className="modal-footer-right">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setDeletingItem(null)}
                >
                  Hủy
                </button>
                <button type="button" className="btn-primary btn-danger" onClick={handleDelete}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}