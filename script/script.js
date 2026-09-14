const VERCEL_BASE_URL ="https://apivga.vercel.app";
// API UPLOAD
const VERCEL_UPLOAD_API =VERCEL_BASE_URL + "/api/upload";
// API LIST
const VERCEL_LIST_API =VERCEL_BASE_URL + "/api/list";
// =====================================================
// MULTI FILE UPLOAD
// =====================================================

// -----------------------------------------------------
// TENTUKAN FOLDER BERDASARKAN HALAMAN
// -----------------------------------------------------
function getUploadFolder() {

    const halaman =window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (halaman === "converter.html") {
        return "Converter";

    }
    if (halaman === "mcu.html") {
        return "MCU";
    }
    if (halaman === "hmi.html") {
        return "Hmi";
    }
    return null;
}
// -----------------------------------------------------
// TAMPILKAN FORM UPLOAD
// -----------------------------------------------------
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


// -----------------------------------------------------
// TAMPILKAN NAMA FILE YANG DIPILIH
// -----------------------------------------------------

function tampilkanFileDipilih() {

    const input =
        document.getElementById("fileInput");


    const daftar =
        document.getElementById("fileList");


    if (!input || !daftar) {

        return;

    }


    daftar.innerHTML = "";


    if (input.files.length === 0) {

        daftar.innerHTML =
            "<p>Belum ada file dipilih.</p>";

        return;

    }


    const judul =
        document.createElement("h3");

    judul.textContent =
        "File yang dipilih: " +
        input.files.length;


    daftar.appendChild(judul);


    for (
        let i = 0;
        i < input.files.length;
        i++
    ) {

        const file =
            input.files[i];


        const item =
            document.createElement("div");


        item.className =
            "upload-file-item";


        item.textContent =
            (i + 1) +
            ". " +
            file.name +
            " (" +
            formatUkuranFile(file.size) +
            ")";


        daftar.appendChild(item);

    }

}


// -----------------------------------------------------
// FORMAT UKURAN FILE
// -----------------------------------------------------

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


    return (
        (bytes /
            Math.pow(1024, index)
        ).toFixed(2)
        +
        " " +
        ukuran[index]
    );

}


// -----------------------------------------------------
// KONVERSI FILE KE BASE64
// -----------------------------------------------------

function fileKeBase64(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = function () {

                const result = reader.result;
                const base64 =result.split(",")[1];
                resolve(base64);
            };


            reader.onerror =
                function () {
                    reject(  new Error( "Gagal membaca file") );
                };
            reader.readAsDataURL(file);
        }
    );
}


// -----------------------------------------------------   
// UPLOAD SEMUA FILE
// -----------------------------------------------------

async function uploadSemuaFile() {
    const input = document.getElementById("fileInput");
    const status = document.getElementById("uploadStatus");
    const folderInput = document.getElementById("folderInput");
    if (!input || !status || !folderInput) {
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
    // CEK NAMA SUBFOLDER
    // -------------------------------------------------
    if (!folderInput) {
        status.innerHTML = "❌ Input nama folder tidak ditemukan.";
        return;
    }
    const subfolder = folderInput.value.trim();
    if (subfolder === "") {
        status.innerHTML ="❌ Silakan masukkan nama folder.";
        return;
    }
    // -------------------------------------------------
    // TENTUKAN FOLDER
    // -------------------------------------------------

    const folder = getUploadFolder();


    if (!folder) {

        status.innerHTML =
            "❌ Folder upload tidak diketahui.";

        return;

    }


    // -------------------------------------------------
    // TAMPILKAN STATUS
    // -------------------------------------------------

    status.innerHTML =
        "⏳ Menyiapkan upload...";


    let berhasil = 0;

    let gagal = 0;


    // -------------------------------------------------
    // UPLOAD FILE SATU PER SATU
    // -------------------------------------------------

    for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        status.innerHTML = "⏳ Upload file " + (i + 1) + " dari " + input.files.length +": " + file.name;
        try {
            // -----------------------------------------
            // KONVERSI BASE64
            // -----------------------------------------
            const base64 =  await fileKeBase64(file);
            // -----------------------------------------
            // DATA KE VERCEL
            // -----------------------------------------

    const data = {
        filename: file.name,
        content: base64,
        folder: folder,
        subfolder: subfolder

    };

            // -----------------------------------------
            // REQUEST
            // -----------------------------------------

            const response = await fetch( VERCEL_UPLOAD_API,
                    {
                        method: "POST",
                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(data)

                    }
                );


            const result =
                await response.json();


            // -----------------------------------------
            // CEK HASIL
            // -----------------------------------------

            if (!response.ok ||
                !result.success) {

                throw new Error(result.message || "Upload gagal");

            }


            berhasil++;


        } catch (error) {

            console.error(
                "Upload error:",
                error
            );


            gagal++;

        }

    }


    // -------------------------------------------------
    // HASIL AKHIR
    // -------------------------------------------------

    status.innerHTML =
        "✅ Upload selesai.<br>" +
        "Berhasil: " +
        berhasil +
        "<br>" +
        "Gagal: " +
        gagal;


    // -------------------------------------------------
    // RESET INPUT
    // -------------------------------------------------

    input.value = "";


    const daftar =
        document.getElementById("fileList");


    if (daftar) {

        daftar.innerHTML = "";

    }


    // -------------------------------------------------
    // LOAD FILE TERBARU
    // -------------------------------------------------

    if (
        typeof loadFileFolder ===
        "function"
    ) {

        loadFileFolder();

    }

}


// -----------------------------------------------------
// EVENT PILIH FILE
// -----------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    function () {

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

    }
);



function getUploadFolder() {

    const halaman =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    // =========================================
    // CONVERTER
    // =========================================

    if (halaman === "converter.html") {

        return "converter";

    }


    // =========================================
    // MONO CHROME / MCU
    // =========================================

    if (
        halaman === "monochrome.html" ||
        halaman === "mcu.html"
    ) {

        return "mcu";

    }


    // =========================================
    // HMI
    // =========================================

    if (halaman === "hmi.html") {

        return "hmi";

    }


    return null;

}

// =====================================================
// TENTUKAN FOLDER UTAMA UNTUK DAFTAR FOLDER
// =====================================================

function getFolderUtama() {

    const halaman = window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    if (halaman === "converter.html") {
        return "converter";
    }

    if ( halaman === "monochrome.html" || halaman === "mcu.html") {
        return "mcu";
    }

    if (halaman === "hmi.html") {
        return "hmi";
    }
    return null;
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
        folderList.innerHTML =  "❌ Folder halaman tidak diketahui.";
        return;
    }

    folderList.innerHTML =  "⏳ Memuat daftar folder...";
    try {
        const url = VERCEL_LIST_API + "?folder=" + encodeURIComponent(folderUtama);
        const response = await fetch(url);
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Gagal mengambil daftar folder"
            );
        }

        if ( !result.folders || result.folders.length === 0) {
            folderList.innerHTML = "<p>Belum ada folder.</p>";
            return;
        }
        folderList.innerHTML = "";
        result.folders.forEach(folder => {
            const item = document.createElement("div");
            item.className = "folder-item";
            item.innerHTML = `
                <button type="button" onclick="bukaFolder('${escapeHtml(folder.name)}')" >
                    📁 ${escapeHtml(folder.name)}
                </button>`;

            folderList.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Error load folder:",
            error
        );

        folderList.innerHTML =
            "❌ Gagal memuat folder.";
    }
}


// =====================================================
// AMANKAN TEKS HTML
// =====================================================

function escapeHtml(text) {

    const div = document.createElement("div");
    div.textContent = text;

    return div.innerHTML;
}}


// =====================================================
// KETIKA FOLDER DIKLIK
// =====================================================

async function bukaFolder(namaFolder) {

    const folderUtama = getFolderUtama();
    const fileList = document.getElementById("fileListFolder");
    const judul = document.getElementById("judulFile");

    if (!folderUtama || !fileList) {
        return;
    }

    if (judul) {

        judul.textContent =
            "Isi Folder: " + namaFolder;
    }

    fileList.innerHTML =
        "⏳ Memuat file...";

    try {

        const url =
            VERCEL_LIST_API +
            "?folder=" +
            encodeURIComponent(folderUtama) +
            "&subfolder=" +
            encodeURIComponent(namaFolder);

        const response =
            await fetch(url);

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Gagal membaca isi folder"
            );
        }

        if (
            !result.files ||
            result.files.length === 0
        ) {

            fileList.innerHTML =
                "<p>Folder ini masih kosong.</p>";

            return;
        }

        fileList.innerHTML = "";

        result.files.forEach(file => {

            const item =
                document.createElement("div");

            item.className =
                "file-item";

            item.innerHTML = `

                <div class="file-info">

                    <span class="file-icon">
                        📄
                    </span>

                    <span class="file-name">
                        ${escapeHtml(file.name)}
                    </span>

                </div>

                <div class="file-action">

                    <a
                        href="${file.download_url}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Buka / Download
                    </a>

                </div>
            `;

            fileList.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Error load file:",
            error
        );

        fileList.innerHTML =
            "❌ Gagal memuat isi folder.";
    }
}

// =====================================================
// LOAD FOLDER SAAT HALAMAN DIBUKA
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadDaftarFolder();

    }
);



