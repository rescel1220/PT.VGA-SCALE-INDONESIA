function logout() {
    sessionStorage.removeItem("loginStatus");    // Hapus status login
    window.location.href = "index.html";    // Kembali ke halaman login
}
// KONFIGURASI API VERCEL
const VERCEL_BASE_URL = "https://apivga.vercel.app";
const VERCEL_UPLOAD_API = VERCEL_BASE_URL + "/api/upload";
const VERCEL_LIST_API = VERCEL_BASE_URL + "/api/list";
let folderAktif = null;
// TENTUKAN FOLDER UTAMA BERDASARKAN HALAMAN
function getFolderUtama() {
    const halaman =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();
    if (halaman === "converter.html") {    // CONVERTER
        return "converter";
    }
    if (halaman === "mcu.html") {    // MONOCHROME / MCU
        return "mcu";
    }
    if (halaman === "hmi.html") {    // HMI
        return "hmi";
    }
    return null;
}
function getUploadFolder() {// FOLDER UPLOAD
    return getFolderUtama();
}
function tampilkanFormUpload() {// TAMPILKAN / SEMBUNYIKAN FORM UPLOAD
    const form = document.getElementById("uploadForm");
    const folderInput = document.getElementById("folderInput");
    const status = document.getElementById("uploadStatus");
    if (!form) {
        return;
    }
    if (!folderAktif) {     // MODE 1 : BUAT FOLDER BARU
        if (folderInput) {        // Folder belum dipilih// User harus mengisi nama folder sendiri
            folderInput.value = "";
            folderInput.readOnly = false;
            folderInput.placeholder = "Contoh: mesin_001";
        }
        form.style.display = "block";        // Tampilkan form
        if (status) {
            status.innerHTML ="📁 <b>Buat folder baru</b><br>" + "Masukkan nama folder kemudian pilih file.";
        }
        return;
    }
    if (folderInput) {    // MODE 2 : TAMBAH FILE KE FOLDER YANG SUDAH ADA
        folderInput.value = folderAktif;        // Gunakan folder yang sedang dipilih
        folderInput.readOnly = true;        // Tidak boleh diganti
    }
    form.style.display = "block";    // Tampilkan form
    if (status) {
        status.innerHTML =
            "📁 Folder tujuan: <b>" +
            escapeHtml(folderAktif) +
            "</b><br>" +
            "Pilih file yang ingin ditambahkan.";
    }
}
function aturHakAksesUpload() {// ATUR HAK AKSES UPLOAD
    const status =sessionStorage.getItem("loginStatus");
    const uploadArea =document.getElementById("uploadArea");
    const uploadForm =document.getElementById("uploadForm");
    const uploadButton =document.getElementById("uploadButton");
    if (!status) {    // TIDAK ADA STATUS LOGIN
        return;
    }
    if (status === "visitor") {    // PENGUNJUNg
        if (uploadArea) {        // Sembunyikan seluruh area upload
            uploadArea.style.display = "none";
        }
        if (uploadForm) {        // Pengaman tambahan
            uploadForm.style.display = "none";
        }
        if (uploadButton) {
            uploadButton.style.display = "none";
        }
        console.log("Mode Pengunjung: seluruh fungsi upload disembunyikan");
        return;
    }
    if (status === "user" ||status === "admin") {    // USER / ADMIN
        if (uploadArea) {
            uploadArea.style.display = "block";
        }
        if (uploadButton) {
            uploadButton.style.display = "inline-block";
        }
        console.log("Mode " + status + ": Upload tersedia");
    }
}
function tampilkanFileDipilih() {// TAMPILKAN FILE YANG DIPILIH
    const input =document.getElementById("fileInput");
    const daftar = document.getElementById("fileList");
    if (!input || !daftar) {
        return;
    }
    daftar.innerHTML = "";
    if (input.files.length === 0) {
        daftar.innerHTML = "<p>Belum ada file dipilih.</p>";
        return;
    }
    const judul =document.createElement("h3");
    judul.textContent ="File yang dipilih: " + input.files.length;
    daftar.appendChild(judul);
    for (let i = 0; i < input.files.length; i++) {
        const file =input.files[i];
        const item = document.createElement("div");
        item.className = "upload-file-item";
        item.textContent =(i + 1) + ". " + file.name + " (" + formatUkuranFile(file.size) + ")"; daftar.appendChild(item);
    }
}
// FORMAT UKURAN FILE
function formatUkuranFile(bytes) {
    if (bytes === 0) {
        return "0 Byte";
    }
    
    const ukuran = [
        "Byte",
        "KB",
        "MB",
        "GB",
        "TB"
    ];

    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    const indexAman = Math.min(index, ukuran.length - 1 );
    return (bytes / Math.pow(1024, indexAman)).toFixed(2) + " " + ukuran[indexAman];
}
// UPLOAD SEMUA FILE
async function uploadSemuaFile() {
    const input =document.getElementById("fileInput");
    const status =document.getElementById("uploadStatus");
    const folderInput =document.getElementById("folderInput");
    if (!input || !status || !folderInput) {
        console.error("Element upload tidak lengkap.");
        return;
    }
    if (input.files.length === 0) {    // CEK FILE
        status.innerHTML ="❌ Silakan pilih file terlebih dahulu.";
        return;
    }
    let subfolder = folderInput.value.trim();    // AMBIL NAMA SUBFOLDER
    if (folderAktif) {
        subfolder = folderAktif;
        console.log("Menggunakan folder aktif:", folderAktif);
    }
    if (subfolder === "") {
    status.innerHTML = "❌ Silakan pilih folder atau masukkan nama folder.";
    return;
    }
    const folder = getUploadFolder();    // AMBIL FOLDER UTAMA
    if (!folder) {
        status.innerHTML = "❌ Folder utama tidak diketahui.";
        return;
    }
    console.log("Folder utama:", folder);
    console.log("Subfolder:", subfolder);
    status.innerHTML = "⏳ Menyiapkan upload...";    // STATUS
    let berhasil = 0;
    let gagal = 0;
    let daftarGagal = [];
    for (let i = 0; i < input.files.length; i++ ) {    // UPLOAD SATU PER SATU
        const file =input.files[i];

        status.innerHTML =
            "⏳ Upload file " +
            (i + 1) +
            " dari " +
            input.files.length +
            ": <b>" +
            escapeHtml(file.name) +
            "</b><br>" +
            "Ukuran: " +
            formatUkuranFile(file.size);

        try {            // FILE LANGSUNG DIKIRIM            // TIDAK ADA BASE64
            const url =
                VERCEL_UPLOAD_API +
                "?filename=" +
                encodeURIComponent(file.name) +
                "&folder=" +
                encodeURIComponent(folder) +
                "&subfolder=" +
                encodeURIComponent(subfolder);

            console.log("UPLOAD URL:", url );
            console.log("FILE:", file.name);
            console.log("SIZE:", formatUkuranFile(file.size));
            const response =            // REQUEST
                await fetch(url,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                file.type || "application/octet-stream"
                        },
                        body: file
                    }
                );
            // BACA RESPONSE
            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                throw new Error("Server tidak mengirim response JSON. HTTP " + response.status);
            }
            console.log( "Response upload:", result );
            if (!response.ok || !result.success) {            // CEK RESPONSE
                throw new Error(result.message || "Upload gagal. HTTP " + response.status);
            }
            berhasil++;            // BERHASIL
            console.log("✅ Upload berhasil:", file.name);
        }
        catch (error) {
            console.error("❌ Upload error:", file.name, error);
            gagal++;
            daftarGagal.push(file.name +" — " + error.message);
        }
    }
    // HASIL AKHIR
    if (gagal === 0) {
        status.innerHTML =
            "✅ Semua file berhasil diupload.<br>" +
            "Folder utama: <b>" +
            escapeHtml(folder) +
            "</b><br>" +
            "Subfolder: <b>" +
            escapeHtml(subfolder) +
            "</b><br>" +
            "Jumlah file: <b>" +
            berhasil +
            "</b>";
    }
    else {
        status.innerHTML =
            "⚠️ Upload selesai.<br>" +
            "Berhasil: <b>" +
            berhasil +
            "</b><br>" +
            "Gagal: <b>" +
            gagal +
            "</b>";
        
        if (daftarGagal.length > 0) {
            status.innerHTML +=
                "<br><br>" +
                "<b>File yang gagal:</b>";
            daftarGagal.forEach(
                function (item) {
                    status.innerHTML +=
                        "<br>❌ " +
                        escapeHtml(item);
                }
            );
        }
    }
    input.value = "";    // RESET FILE INPUT
    const daftar = document.getElementById("fileList");
    if (daftar) {
        daftar.innerHTML = "";
    }
    folderInput.value = folderAktif || "";    // KOSONGKAN NAMA FOLDER
    await loadDaftarFolder();    // REFRESH DAFTAR FOLDER
}
function escapeHtml(text) {// ESCAPE HTML
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
async function loadDaftarFolder() {// LOAD DAFTAR SUBFOLDER
    const folderList =document.getElementById("folderList");
    if (!folderList) {
        return;
    }
    const folderUtama = getFolderUtama();
    if (!folderUtama) {
        folderList.innerHTML =  "❌ Folder halaman tidak diketahui.";
        return;
    }
    folderList.innerHTML = "⏳ Memuat daftar folder...";
    try {
        // API
        const url =VERCEL_LIST_API + "?folder=" + encodeURIComponent(folderUtama);
        console.log("LOAD FOLDER:", url);
        const response = await fetch(url);
        const result = await response.json();
        console.log("RESULT FOLDER:",result);
        if (!response.ok || !result.success) {
            throw new Error(result.message || "Gagal mengambil daftar folder");
        }
        if (!result.folders || result.folders.length === 0) {        // TIDAK ADA FOLDER
            folderList.innerHTML = "<p>Belum ada folder.</p>";
            return;
        }
        // TAMPILKAN FOLDER
        folderList.innerHTML = "";
        result.folders.forEach(
            function (folder) {
                const item =document.createElement("div");
                item.className = "folder-item";
                const button = document.createElement("button");
                button.type ="button";
                button.textContent = "📁 " + folder.name;
                button.addEventListener("click", function () {
                        bukaFolder(folder.name);
                    }
                );
                item.appendChild(button);
                folderList.appendChild(item);
            }
        );
    }
    catch (error) {
        console.error("Error load folder:", error);
        folderList.innerHTML =
            "❌ Gagal memuat folder.<br>" +
            "<small>" +
            escapeHtml(error.message) +
            "</small>";
    }
}
async function bukaFolder(namaFolder) {// BUKA FOLDER
    folderAktif = namaFolder;
    const folderInput = document.getElementById("folderInput");
    if (folderInput) {
        folderInput.value = namaFolder;
        folderInput.readOnly = true;
    }
    console.log("Folder aktif:", folderAktif);
    const folderUtama =getFolderUtama();
    const fileList = document.getElementById("fileListFolder");
    const judul =document.getElementById("judulFile");
    if (!folderUtama || !fileList) {
        return;
    }
    if (judul) {    // JUDUL
        judul.textContent ="Isi Folder: " + namaFolder;
    }
    fileList.innerHTML = "⏳ Memuat file...";
    try {
        // URL LIST FILE
        const url = VERCEL_LIST_API + "?folder=" + encodeURIComponent(folderUtama) + "&subfolder=" + encodeURIComponent(namaFolder);
        console.log("LOAD FILE:", url);
        // REQUEST
        const response = await fetch(url);
        const result = await response.json();
        console.log("RESULT FILE:", result);
        // CEK RESPONSE
        if (!response.ok || !result.success) {
            throw new Error(result.message || "Gagal membaca isi folder");
        }
        // FOLDER KOSONG
        if (!result.files || result.files.length === 0) {
            fileList.innerHTML ="<p>Folder ini masih kosong.</p>";
            return;
        }
        // TAMPILKAN FILE
        fileList.innerHTML = "";
        result.files.forEach(
            function (file) {
                const item = document.createElement("div");
                item.className ="file-item";
                const info =document.createElement("div");
                info.className = "file-info";
                const icon = document.createElement("span");
                icon.className ="file-icon";
                icon.textContent ="📄";

                const name =document.createElement("span");
                name.className ="file-name";
                name.textContent =file.name;
                info.appendChild(icon);
                info.appendChild(name);
                // ACTION
                const action =document.createElement("div");
                action.className ="file-action";
                const link = document.createElement("a" );
                link.href =file.download_url;
                link.target ="_blank";
                link.rel ="noopener noreferrer";
                link.textContent ="Buka / Download";
                action.appendChild(link);
                // GABUNGKAN
                item.appendChild(info);
                item.appendChild(action);
                fileList.appendChild(item);

            }
        );

    }
    catch (error) {
        console.error( "Error load file:", error);
        fileList.innerHTML =
            "❌ Gagal memuat isi folder.<br>" +
            "<small>" +
            escapeHtml(
                error.message
            ) +
            "</small>";
    }
}
function cekStatusLogin() {// CEK STATUS LOGIN
    const status =sessionStorage.getItem("loginStatus");
    console.log("Status login:",status);
}
// EVENT DOM READY
document.addEventListener(
    "DOMContentLoaded",
    function () {
        cekStatusLogin();
        aturHakAksesUpload();
        const input =document.getElementById("fileInput");        // FILE INPUT
        if (input) {
            input.addEventListener("change",tampilkanFileDipilih);
        }
        loadDaftarFolder();        // LOAD FOLDER
    }
);

async function login() {
    const username = document.getElementById("username").value.trim();
    const password =document.getElementById("password").value;
    const message =document.getElementById("message");
    if (username === "" || password === "") {    // CEK INPUT
        message.innerHTML ="❌ Username dan password harus diisi.";
        return;
    }
    message.innerHTML =  "⏳ Memeriksa login...";    // TAMPILKAN PROSES
    try {
        // KIRIM KE VERCEL
        const response =
            await fetch(
                VERCEL_BASE_URL + "/api/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":"application/json"
                    },
                    body:
                        JSON.stringify({
                            username:username,
                            password:password
                        })
                }
            );
        const result =await response.json();        // BACA RESPONSE
        console.log("LOGIN RESPONSE:",result
        );
        if ( !response.ok ||!result.success) {        // LOGIN GAGAL
            message.innerHTML ="❌ " + (result.message || "Login gagal.");
            return;
        }
        sessionStorage.setItem("loginStatus", result.role);        // SIMPAN STATUS LOGIN
        sessionStorage.setItem("loginUsername",username);        // SIMPAN USERNAME
        message.innerHTML = "✅ Login berhasil sebagai " + result.role + "...";        // LOGIN BERHASIL
        // MASUK HOME
        setTimeout(
            function () {
                window.location.href =  "home.html";
            },
            500
        );
    }

    catch (error) {
        console.error("LOGIN ERROR:", error );
        message.innerHTML =
            "❌ Tidak dapat terhubung ke server.<br>" +
            "<small>" +
            escapeHtml(
                error.message
            ) +
            "</small>";
    }
}


function guestLogin() {
    sessionStorage.setItem( "loginStatus", "visitor");
    sessionStorage.removeItem( "loginUsername" );
    window.location.href ="home.html";
}
