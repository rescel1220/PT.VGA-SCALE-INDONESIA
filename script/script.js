const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
// =====================================================
// KONFIGURASI API VERCEL
// =====================================================
const VERCEL_BASE_URL = "https://apivga.vercel.app";
const VERCEL_UPLOAD_API =VERCEL_BASE_URL + "/api/upload";
const VERCEL_LIST_API =VERCEL_BASE_URL + "/api/list";
// =====================================================
// TENTUKAN FOLDER UTAMA BERDASARKAN HALAMAN
// =====================================================
function getFolderUtama() {
    const halaman =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();
    // CONVERTER
    if (halaman === "converter.html") {
        return "converter";
    }
    // MONOCHROME / MCU
    if (halaman === "monochrome.html" ||halaman === "mcu.html" ) {
        return "mcu";
    }
    // HMI
    if (halaman === "hmi.html") {
        return "hmi";
    }
    return null;
}
// =====================================================
// FOLDER UPLOAD
// =====================================================
function getUploadFolder() {
    return getFolderUtama();
}
// =====================================================
// TAMPILKAN / SEMBUNYIKAN FORM UPLOAD
// =====================================================
function tampilkanFormUpload() {
    const form =document.getElementById("uploadForm");
    if (!form) {
        return;
    }
    if (form.style.display === "block") {
        form.style.display = "none";
    } else {
        form.style.display = "block";
    }

}
// =====================================================
// TAMPILKAN FILE YANG DIPILIH
// =====================================================
function tampilkanFileDipilih() {
    const input = document.getElementById("fileInput");
    const daftar =document.getElementById("fileList");
    if (!input || !daftar) {
        return;
    }
    daftar.innerHTML = "";
    if (input.files.length === 0) {
        daftar.innerHTML ="<p>Belum ada file dipilih.</p>";
        return;
    }
    const judul =document.createElement("h3");
    judul.textContent = "File yang dipilih: " + input.files.length;
    daftar.appendChild(judul);
    for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const item = document.createElement("div");
        item.className ="upload-file-item";
        item.textContent =(i + 1) + ". " + file.name + "(" + formatUkuranFile(file.size) + ")"; daftar.appendChild(item);
    }
}
// =====================================================
// FORMAT UKURAN FILE
// =====================================================
function formatUkuranFile(bytes) {
    if (bytes === 0) {
        return "0 Byte";
    }
    const ukuran = [
        "Byte",
        "KB",
        "MB",
        "GB"
    ];

    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );

    return ((bytes / Math.pow(1024, index)).toFixed(2) + " " + ukuran[index]);
}
// =====================================================
// FILE -> BASE64
// =====================================================
function fileKeBase64(file) {
    return new Promise(
        (resolve, reject) => {
            const reader = new FileReader();
            reader.onload =function () {
                    try {
                        const result = reader.result;
                        const base64 = result.split(",")[1];
                        resolve(base64);
                    } catch (error) {
                        reject(error);
                    }
                };
            reader.onerror = function () {
                    reject( new Error("Gagal membaca file")
                    );
                };
            reader.readAsDataURL(file);
        }
    );
}
// =====================================================
// UPLOAD SEMUA FILE
// =====================================================
async function uploadSemuaFile() {
    const input = document.getElementById("fileInput");
    const status = document.getElementById("uploadStatus");
    const folderInput = document.getElementById("folderInput");
    if (!input || !status || !folderInput) {
        console.error( "Element upload tidak lengkap.");
        return;
    }
    // -------------------------------------------------
    // CEK FILE
    // -------------------------------------------------
    if (input.files.length === 0) {
        status.innerHTML = "❌ Silakan pilih file terlebih dahulu.";
        return;
    }
    // -------------------------------------------------
    // AMBIL NAMA SUBFOLDER
    // -------------------------------------------------
    const subfolder = folderInput.value.trim();
    if (subfolder === "") {
        status.innerHTML ="❌ Silakan masukkan nama folder.";
        return;
    }
    // -------------------------------------------------
    // AMBIL FOLDER UTAMA
    // -------------------------------------------------
    const folder = getUploadFolder();
    if (!folder) {
        status.innerHTML ="❌ Folder utama tidak diketahui.";
        return;
    }
    console.log("Folder utama:",folder);
    console.log( "Subfolder:", subfolder);
    // -------------------------------------------------
    // STATUS
    // -------------------------------------------------
    status.innerHTML ="⏳ Menyiapkan upload...";
    let berhasil = 0;
    let gagal = 0;
    // =================================================
    // UPLOAD SATU PER SATU
    // =================================================
    for ( let i = 0; i < input.files.length; i++) {
        const file =input.files[i];
        
        status.innerHTML =
            "⏳ Upload file " +
            (i + 1) +
            " dari " +
            input.files.length +
            ": " +
            file.name;
        try {
            // -----------------------------------------
            // BASE64
            // -----------------------------------------
            const base64 = await fileKeBase64(file);
            // -----------------------------------------
            // DATA YANG DIKIRIM KE VERCEL
            // -----------------------------------------
            const data = {
                filename: file.name,
                content: base64,
                folder: folder, 
                subfolder: subfolder
            };
            console.log( "Data upload:",data);
            // -----------------------------------------
            // REQUEST
            // -----------------------------------------
            const response =
                await fetch(
                    VERCEL_UPLOAD_API,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body:
                            JSON.stringify(data)
                    }
                );
            // -----------------------------------------
            // BACA RESPONSE
            // -----------------------------------------
            const result = await response.json();
            console.log("Response upload:",result);
            // -----------------------------------------
            // CEK RESPONSE
            // -----------------------------------------

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Upload gagal" );
            }
            berhasil++;
        } catch (error) {
            console.error("Upload error:", error);
            gagal++;
        }
    }
    // =================================================
    // HASIL AKHIR
    // =================================================
    if (gagal === 0) {
        status.innerHTML =
            "✅ Semua file berhasil diupload.<br>" +
            "Folder utama: <b>" +
            folder +
            "</b><br>" +
            "Subfolder: <b>" +
            subfolder +
            "</b><br>" +
            "Jumlah file: <b>" +
            berhasil +
            "</b>";

    } else {
        status.innerHTML =
            "⚠️ Upload selesai.<br>" +
            "Berhasil: " +
            berhasil +
            "<br>" +
            "Gagal: " +
            gagal;

    }
    // =================================================
    // RESET FILE INPUT
    // =================================================
    input.value = "";
    const daftar = document.getElementById("fileList");
    if (daftar) {
        daftar.innerHTML = "";
    }
    // =================================================
    // KOSONGKAN NAMA FOLDER
    // =================================================
    folderInput.value = "";
    // =================================================
    // REFRESH DAFTAR FOLDER
    // =================================================
    await loadDaftarFolder();

}
// =====================================================
// ESCAPE HTML
// =====================================================
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
// =====================================================
// LOAD DAFTAR SUBFOLDER
// =====================================================
async function loadDaftarFolder() {
    const folderList = document.getElementById("folderList");
    if (!folderList) {
        return;
    }
    const folderUtama = getFolderUtama();
    if (!folderUtama) {
        folderList.innerHTML ="❌ Folder halaman tidak diketahui.";
        return;
    }
    folderList.innerHTML = "⏳ Memuat daftar folder...";
    try {
        // ---------------------------------------------
        // API
        // ---------------------------------------------
        const url =
            VERCEL_LIST_API +
            "?folder=" +
            encodeURIComponent(folderUtama);
        console.log("LOAD FOLDER:", url);
        const response =await fetch(url);
        const result = await response.json();
        console.log("RESULT FOLDER:", result);
        if ( !response.ok || !result.success) {
            throw new Error(result.message || "Gagal mengambil daftar folder");
        }
        // ---------------------------------------------
        // TIDAK ADA FOLDER
        // ---------------------------------------------
        if ( !result.folders || result.folders.length === 0) {
            folderList.innerHTML = "<p>Belum ada folder.</p>";
            return;
        }
        // ---------------------------------------------
        // TAMPILKAN FOLDER
        // ---------------------------------------------
        folderList.innerHTML = "";
        result.folders.forEach(
            function (folder) {
                const item = document.createElement("div");
                item.className = "folder-item";
                const button = document.createElement("button");
                button.type ="button";
                button.textContent = "📁 " + folder.name;
                // PENTING:
                // Jangan menggunakan onclick string.
                // Gunakan addEventListener.
                button.addEventListener(
                    "click",
                    function () {
                        bukaFolder(
                            folder.name
                        );
                    }
                );
                item.appendChild(button);
                folderList.appendChild(item);
            }
        );
    } catch (error) {
        console.error(
            "Error load folder:",
            error
        );
        folderList.innerHTML =
            "❌ Gagal memuat folder.<br>" +
            "<small>" +
            escapeHtml(error.message) +
            "</small>";
    }
}
// =====================================================
// BUKA FOLDER
// =====================================================

async function bukaFolder(namaFolder) {

    const folderUtama =
        getFolderUtama();


    const fileList =
        document.getElementById(
            "fileListFolder"
        );


    const judul =
        document.getElementById(
            "judulFile"
        );


    if (
        !folderUtama ||
        !fileList
    ) {

        return;
    }


    // -------------------------------------------------
    // JUDUL
    // -------------------------------------------------

    if (judul) {

        judul.textContent =
            "Isi Folder: " +
            namaFolder;

    }


    fileList.innerHTML =
        "⏳ Memuat file...";


    try {

        // ---------------------------------------------
        // URL LIST FILE
        // ---------------------------------------------

        const url =
            VERCEL_LIST_API +
            "?folder=" +
            encodeURIComponent(folderUtama) +
            "&subfolder=" +
            encodeURIComponent(namaFolder);


        console.log(
            "LOAD FILE:",
            url
        );


        // ---------------------------------------------
        // REQUEST
        // ---------------------------------------------

        const response =
            await fetch(url);


        const result =
            await response.json();


        console.log(
            "RESULT FILE:",
            result
        );


        // ---------------------------------------------
        // CEK RESPONSE
        // ---------------------------------------------

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Gagal membaca isi folder"
            );

        }


        // ---------------------------------------------
        // FOLDER KOSONG
        // ---------------------------------------------

        if (
            !result.files ||
            result.files.length === 0
        ) {

            fileList.innerHTML =
                "<p>Folder ini masih kosong.</p>";

            return;
        }


        // ---------------------------------------------
        // TAMPILKAN FILE
        // ---------------------------------------------

        fileList.innerHTML = "";


        result.files.forEach(
            function (file) {

                const item =
                    document.createElement("div");


                item.className =
                    "file-item";


                const info =
                    document.createElement("div");


                info.className =
                    "file-info";


                const icon =
                    document.createElement("span");


                icon.className =
                    "file-icon";


                icon.textContent =
                    "📄";


                const name =
                    document.createElement("span");


                name.className =
                    "file-name";


                name.textContent =
                    file.name;


                info.appendChild(icon);

                info.appendChild(name);


                // -------------------------------------
                // ACTION
                // -------------------------------------

                const action =
                    document.createElement("div");


                action.className =
                    "file-action";


                const link =
                    document.createElement("a");


                link.href =
                    file.download_url;


                link.target =
                    "_blank";


                link.rel =
                    "noopener noreferrer";


                link.textContent =
                    "Buka / Download";


                action.appendChild(link);


                // -------------------------------------
                // GABUNGKAN
                // -------------------------------------

                item.appendChild(info);

                item.appendChild(action);


                fileList.appendChild(item);

            }
        );


    } catch (error) {

        console.error(
            "Error load file:",
            error
        );


        fileList.innerHTML =
            "❌ Gagal memuat isi folder.<br>" +
            "<small>" +
            escapeHtml(error.message) +
            "</small>";

    }

}


// =====================================================
// EVENT DOM READY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // ---------------------------------------------
        // FILE INPUT
        // ---------------------------------------------

        const input =
            document.getElementById(
                "fileInput"
            );


        if (input) {

            input.addEventListener(
                "change",
                tampilkanFileDipilih
            );

        }


        // ---------------------------------------------
        // LOAD FOLDER
        // ---------------------------------------------

        loadDaftarFolder();

    }
);
