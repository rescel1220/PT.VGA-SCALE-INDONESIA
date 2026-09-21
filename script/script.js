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
     if (halaman === "converter.html") {
        return "converter";
    }
    if (halaman === "mcu.html") {
        return "mcu";
    }
    if (halaman === "hmi.html") {
        return "hmi";
    }
    return null;
}
function getUploadFolder() {
    return getFolderUtama();
}
function tampilkanFormUpload() {
    // MODE BUAT FOLDER BARU
    folderAktif = null;
    modeUpload = "baru";
    const form =document.getElementById("uploadForm");
    const folderInput =document.getElementById("folderInput");
    const status =document.getElementById("uploadStatus");
    if (!form) {
        return;
    }
    if (folderInput) {
        folderInput.value = "";
        folderInput.readOnly = false;
        folderInput.placeholder ="Contoh: mesin_001";
    }
    form.style.display = "block";
    if (status) {
        status.innerHTML =
            "📁 <b>Buat folder baru</b><br>" +
            "Masukkan nama folder kemudian pilih file.";
    }
    console.log("MODE UPLOAD = BUAT FOLDER BARU");
}
function aturHakAksesUpload() {
    const status =sessionStorage.getItem("loginStatus");
    const uploadArea =document.getElementById("uploadArea");
    const uploadForm =document.getElementById("uploadForm");
    const uploadButton =document.getElementById("uploadButton");
    if (!status) {
        return;
    }
    if (status === "visitor") {
        if (uploadArea) {
            uploadArea.style.display = "none";
        }
        if (uploadForm) {
            uploadForm.style.display = "none";
        }
        if (uploadButton) {
            uploadButton.style.display = "none";
        }
        console.log("Mode Pengunjung: seluruh fungsi upload disembunyikan");
        return;
    }
    if (status === "user" ||status === "admin") {
        if (uploadArea) {
            uploadArea.style.display = "";
        }
        if (uploadButton) {
            uploadButton.style.display = "";
        }
        console.log("Mode " + status + ": Upload tersedia");
    }
}

function tampilkanFileDipilih() {
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

function formatUkuranFile(bytes) {// FORMAT UKURAN FILE
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
let subfolder = "";
if (modeUpload === "tambah") {
    subfolder = folderAktif;    // Mode tambah file ke folder lama
    console.log("Mode TAMBAH FILE");
    console.log("Folder aktif:", folderAktif);
}
else {
    subfolder =folderInput.value.trim();    // Mode membuat folder baru
    console.log("Mode BUAT FOLDER BARU");
    console.log("Nama folder baru:", subfolder);
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

        try {

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
                await fetch(
                    url,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                file.type || "application/octet-stream"
                        },
                        body: file
                    }
                );

            let result;            // BACA RESPONSE
            try {
                result = await response.json();
            } catch (jsonError) {
                throw new Error(
                    "Server tidak mengirim response JSON. HTTP " +
                    response.status
                );
            }
            console.log( "Response upload:", result );
            if (!response.ok || !result.success) {            // CEK RESPONSE
                throw new Error(result.message || "Upload gagal. HTTP " + response.status);
            }
            berhasil++;
            console.log("✅ Upload berhasil:", file.name);          // BERHASIL
        }
        catch (error) {
            console.error("❌ Upload error:", file.name, error);
            gagal++;
            daftarGagal.push(file.name +" — " + error.message);
        }
    }
    if (gagal === 0) {    // HASIL AKHIR
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
    input.value = ""; // RESET FILE INPUT
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

async function loadDaftarFolder() {

    const folderList =document.getElementById("folderList");
    if (!folderList) {
        console.log("folderList tidak ditemukan.");
        return;
    }
    const folderUtama =getFolderUtama();
    if (!folderUtama) {
        folderList.innerHTML ="❌ Folder halaman tidak diketahui.";
        return;
    }
    folderList.innerHTML ="⏳ Memuat daftar folder...";
    try {
        const url =
            VERCEL_LIST_API +
            "?folder=" +
            encodeURIComponent(folderUtama);

        console.log("LOAD FOLDER:", url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("HTTP Error " + response.status);
        }
        const result =await response.json();
        console.log("RESULT FOLDER:", result);
        if (!result.success) {
            throw new Error(result.message || "Gagal mengambil daftar folder");
        }
        if (!result.folders || !Array.isArray(result.folders) || result.folders.length === 0) {
            folderList.innerHTML = "<p>Belum ada folder.</p>";
            return;
        }
        folderList.innerHTML = "";
        result.folders.forEach(
            function (folder) {
                const item =document.createElement("div");// BARIS FOLDER
                item.className ="folder-item";
                const button =document.createElement("button");                // TOMBOL BUKA FOLDER
                button.type ="button";
                button.textContent ="📁 " + folder.name;
                button.addEventListener("click",
                    function () {
                        bukaFolder(folder.name);
                    }
                );
                item.appendChild(button);
                const statusLogin =sessionStorage.getItem("loginStatus");       // CEK LOGIN
                if (statusLogin === "user" || statusLogin === "admin") {                // TOMBOL "+"
                    const tambahButton =document.createElement("button");
                    tambahButton.type ="button";
                    tambahButton.textContent ="+";
                    tambahButton.title ="Tambah file ke folder " + folder.name;
                    tambahButton.className ="tambah-file-folder";
                    tambahButton.addEventListener("click", function (event) {
                            event.stopPropagation();// Jangan membuka folder
                            tambahFileKeFolder(folder.name);
                        }
                    );
                    item.appendChild(tambahButton);
                }
                folderList.appendChild(item);// TAMPILKAN BARIS
            }
        );
    }
    catch (error) {
        console.error("Error load folder:", error);

        folderList.innerHTML =
            "❌ Gagal memuat folder.<br>" +
            "<small>" +
            escapeHtml(
                error.message
            ) +
            "</small>";
    }
}

function tambahFileKeFolder(namaFolder) {// TAMBAH FILE KE FOLDER YANG SUDAH ADA
    const statusLogin =sessionStorage.getItem("loginStatus");
    if (
        statusLogin !== "user" &&
        statusLogin !== "admin"
    ) {

        alert(
            "Anda tidak memiliki izin untuk menambahkan file."
        );

        return;
    }

    console.log(
        "Tambah file ke folder:",
        namaFolder
    );


    // Buat input file khusus tombol "+"
    const inputTambah =
        document.createElement("input");

    inputTambah.type =
        "file";

    inputTambah.multiple =
        true;

    inputTambah.style.display =
        "none";


    inputTambah.addEventListener(
        "change",
        async function () {

            if (
                !inputTambah.files ||
                inputTambah.files.length === 0
            ) {

                inputTambah.remove();

                return;
            }

            console.log(
                "Folder tujuan:",
                namaFolder
            );

            console.log(
                "Jumlah file:",
                inputTambah.files.length
            );


            await uploadFileKeFolder(
                inputTambah.files,
                namaFolder
            );


            inputTambah.remove();

        }
    );


    document.body.appendChild(
        inputTambah
    );

    inputTambah.click();
}



// =====================================================
// UPLOAD FILE KE FOLDER YANG SUDAH ADA
// =====================================================


async function uploadFileKeFolder(
    files,
    subfolder
) {

    const folder =
        getUploadFolder();

    if (!folder) {

        alert(
            "❌ Folder utama tidak diketahui."
        );

        return;
    }

    const status =
        document.getElementById(
            "uploadStatus"
        );

    if (status) {

        status.innerHTML =
            "⏳ Menambahkan file ke folder <b>" +
            escapeHtml(subfolder) +
            "</b>...";
    }


    let berhasil = 0;
    let gagal = 0;

    const daftarGagal = [];


    for (
        let i = 0;
        i < files.length;
        i++
    ) {

        const file =
            files[i];


        if (status) {

            status.innerHTML =
                "⏳ Upload file " +
                (i + 1) +
                " dari " +
                files.length +
                ": <b>" +
                escapeHtml(file.name) +
                "</b><br>" +
                "Folder: <b>" +
                escapeHtml(subfolder) +
                "</b><br>" +
                "Ukuran: " +
                formatUkuranFile(file.size);
        }


        try {

            const url =
                VERCEL_UPLOAD_API +
                "?filename=" +
                encodeURIComponent(
                    file.name
                ) +
                "&folder=" +
                encodeURIComponent(
                    folder
                ) +
                "&subfolder=" +
                encodeURIComponent(
                    subfolder
                );


            const response =
                await fetch(
                    url,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                file.type ||
                                "application/octet-stream"
                        },

                        body: file
                    }
                );


            let result;

            try {

                result =
                    await response.json();

            }
            catch (error) {

                throw new Error(
                    "Server tidak mengirim response JSON. HTTP " +
                    response.status
                );
            }


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Upload gagal. HTTP " +
                    response.status
                );
            }


            berhasil++;

            console.log(
                "✅ Upload berhasil:",
                file.name
            );

        }
        catch (error) {

            console.error(
                "❌ Upload error:",
                file.name,
                error
            );

            gagal++;

            daftarGagal.push(
                file.name +
                " — " +
                error.message
            );
        }
    }


    // =========================================
    // HASIL UPLOAD
    // =========================================

    if (status) {

        if (gagal === 0) {

            status.innerHTML =
                "✅ Semua file berhasil ditambahkan.<br>" +
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


            daftarGagal.forEach(
                function (item) {

                    status.innerHTML +=
                        "<br>❌ " +
                        escapeHtml(item);

                }
            );
        }
    }


    // Refresh daftar folder
    await loadDaftarFolder();


    // Kalau folder yang sedang dibuka
    // adalah folder tujuan, refresh isinya
    if (
        folderAktif === subfolder
    ) {

        await bukaFolder(
            subfolder
        );
    }
}

// =====================================================
// BUKA FOLDER
// =====================================================

async function bukaFolder(namaFolder) {
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
    // -------------------------------------------------
    // JUDUL
    // -------------------------------------------------
    if (judul) {
        judul.textContent ="Isi Folder: " + namaFolder;
    }
    fileList.innerHTML = "⏳ Memuat file...";
    try {
        // ---------------------------------------------
        // URL LIST FILE
        // ---------------------------------------------
        const url = VERCEL_LIST_API + "?folder=" + encodeURIComponent(folderUtama) + "&subfolder=" + encodeURIComponent(namaFolder);
        console.log("LOAD FILE:", url);
        // ---------------------------------------------
        // REQUEST
        // ---------------------------------------------
        const response = await fetch(url);
        const result = await response.json();
        console.log("RESULT FILE:", result);
        // ---------------------------------------------
        // CEK RESPONSE
        // ---------------------------------------------
        if (!response.ok || !result.success) {
            throw new Error(result.message || "Gagal membaca isi folder");
        }
        // ---------------------------------------------
        // FOLDER KOSONG
        // ---------------------------------------------

        if (!result.files || result.files.length === 0) {
            fileList.innerHTML ="<p>Folder ini masih kosong.</p>";
            return;
        }
        // ---------------------------------------------
        // TAMPILKAN FILE
        // ---------------------------------------------
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


                const name =
                    document.createElement(
                        "span"
                    );

                name.className ="file-name";
                name.textContent = file.name;
                info.appendChild(
                    icon
                );
                info.appendChild( name );


                // -------------------------------------
                // ACTION
                // -------------------------------------

                const action =
                    document.createElement(
                        "div"
                    );


                action.className =
                    "file-action";


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    file.download_url;


                link.target =
                    "_blank";


                link.rel =
                    "noopener noreferrer";


                link.textContent ="Buka / Download";
                action.appendChild(link);
                // -------------------------------------
                // GABUNGKAN
                // -------------------------------------

                item.appendChild(
                    info
                );


                item.appendChild(
                    action
                );


                fileList.appendChild(
                    item
                );

            }
        );

    }


    catch (error) {

        console.error(
            "Error load file:",
            error
        );


        fileList.innerHTML =
            "❌ Gagal memuat isi folder.<br>" +

            "<small>" +

            escapeHtml(
                error.message
            ) +

            "</small>";

    }

}
// =====================================================
// CEK STATUS LOGIN
// =====================================================

function cekStatusLogin() {
    const status =sessionStorage.getItem("loginStatus");
    console.log("Status login:",status);
}

// =====================================================
// EVENT DOM READY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {
        cekStatusLogin();
        aturHakAksesUpload();
        // ---------------------------------------------
        // FILE INPUT
        // ---------------------------------------------
        const input =document.getElementById("fileInput");
        if (input) {
            input.addEventListener("change",tampilkanFileDipilih);
        }


        // ---------------------------------------------
        // LOAD FOLDER
        // ---------------------------------------------

        loadDaftarFolder();

    }
);

async function login() {

    const username =
        document.getElementById("username").value.trim();

    const password =document.getElementById("password").value;
    const message =document.getElementById("message");
    // =================================================
    // CEK INPUT
    // =================================================
    if (username === "" || password === "") {
        message.innerHTML ="❌ Username dan password harus diisi.";
        return;
    }
    // =================================================
    // TAMPILKAN PROSES
    // =================================================

    message.innerHTML =
        "⏳ Memeriksa login...";

    try {

        // =================================================
        // KIRIM KE VERCEL
        // =================================================

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

        // =================================================
        // BACA RESPONSE
        // =================================================
        const result =await response.json();
        console.log("LOGIN RESPONSE:",result
        );
        // =================================================
        // LOGIN GAGAL
        // =================================================
        if ( !response.ok ||!result.success) {
            message.innerHTML ="❌ " + (result.message || "Login gagal.");
            return;
        }
        // =================================================
        // SIMPAN STATUS LOGIN
        // =================================================
        sessionStorage.setItem(
            "loginStatus",
            result.role
        );
        // =================================================
        // SIMPAN USERNAME
        // =================================================
        sessionStorage.setItem("loginUsername",username);
        // =================================================
        // LOGIN BERHASIL
        // =================================================
        message.innerHTML =
            "✅ Login berhasil sebagai " +
            result.role +
            "...";
        //=================================================
        // MASUK HOME
        // =================================================
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
