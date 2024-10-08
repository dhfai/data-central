'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Import pustaka xlsx

const TpsSearch = () => {
  const [kabupatenName, setKabupatenName] = useState('');
  const [kecamatanName, setKecamatanName] = useState('');
  const [kelurahanName, setKelurahanName] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTpsData();
  }, [page]);

  const fetchTpsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/searchTps?kabupatenName=${kabupatenName}&kecamatanName=${kecamatanName}&kelurahanName=${kelurahanName}&page=${page}&pageSize=10`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error fetching TPS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchTpsData();
  };

  // Fungsi untuk mengonversi dan mengunduh data sebagai file Excel
  const downloadExcel = () => {
    const headers = ['Kabupaten ID', 'Kabupaten', 'Kecamatan ID', 'Kecamatan', 'Kelurahan ID', 'Kelurahan'];
    const dataExport = [];

    data.forEach(kabupaten => {
      kabupaten.kecamatan.forEach(kecamatan => {
        kecamatan.kelurahan.forEach(kelurahan => {
          if (kelurahan.tps.length > 0) {
            kelurahan.tps.forEach(tps => {
              dataExport.push({
                'Kabupaten ID': kabupaten.id,
                'Kabupaten': kabupaten.nama,
                'Kecamatan ID': kecamatan.id,
                'Kecamatan': kecamatan.nama,
                'Kelurahan ID': kelurahan.id,
                'Kelurahan': kelurahan.nama
              });
            });
          } else {
            dataExport.push({
              'Kabupaten ID': kabupaten.id,
              'Kabupaten': kabupaten.nama,
              'Kecamatan ID': kecamatan.id,
              'Kecamatan': kecamatan.nama,
              'Kelurahan ID': kelurahan.id,
              'Kelurahan': kelurahan.nama
            });
          }
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, 'TPS Data');
    XLSX.writeFile(wb, 'tps_data.xlsx');
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Pencarian TPS</h1>

      {/* Form Pencarian */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Nama Kabupaten"
            value={kabupatenName}
            onChange={(e) => setKabupatenName(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Nama Kecamatan"
            value={kecamatanName}
            onChange={(e) => setKecamatanName(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="Nama Kelurahan"
            value={kelurahanName}
            onChange={(e) => setKelurahanName(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleSearch}
          className="mt-4 w-full bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 transition-colors"
        >
          Cari
        </button>
      </div>

      {/* Tabel Data */}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-gray-600">Kabupaten ID</th>
                <th className="px-4 py-2 text-left text-gray-600">Kabupaten</th>
                <th className="px-4 py-2 text-left text-gray-600">Kecamatan ID</th>
                <th className="px-4 py-2 text-left text-gray-600">Kecamatan</th>
                <th className="px-4 py-2 text-left text-gray-600">Kelurahan ID</th>
                <th className="px-4 py-2 text-left text-gray-600">Kelurahan</th>
              </tr>
            </thead>
            <tbody>
              {data.map((kabupaten) =>
                kabupaten.kecamatan.map((kecamatan) =>
                  kecamatan.kelurahan.map((kelurahan) =>
                    kelurahan.tps.length > 0 ? (
                      kelurahan.tps.map((tps) => (
                        <tr key={tps.id} className="border-t">
                          <td className="px-4 py-2">{kabupaten.id}</td>
                          <td className="px-4 py-2">{kabupaten.nama}</td>
                          <td className="px-4 py-2">{kecamatan.id}</td>
                          <td className="px-4 py-2">{kecamatan.nama}</td>
                          <td className="px-4 py-2">{kelurahan.id}</td>
                          <td className="px-4 py-2">{kelurahan.nama}</td>
                        </tr>
                      ))
                    ) : (
                      <tr key={kelurahan.id} className="border-t">
                        <td className="px-4 py-2">{kabupaten.id}</td>
                        <td className="px-4 py-2">{kabupaten.nama}</td>
                        <td className="px-4 py-2">{kecamatan.id}</td>
                        <td className="px-4 py-2">{kecamatan.nama}</td>
                        <td className="px-4 py-2">{kelurahan.id}</td>
                        <td className="px-4 py-2">{kelurahan.nama}</td>
                      </tr>
                    )
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tombol Unduh Excel */}
      <button
        onClick={downloadExcel}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 transition-colors"
      >
        Unduh Excel
      </button>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TpsSearch;
