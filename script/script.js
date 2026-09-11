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

    const halaman =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (halaman === "produk1.html") {

        return "Converter";

    }


    if (halaman === "produk2.html") {

        return "MCU";

    }


    if (halaman === "produk3.html") {

        return "Hmi";

    }


    return null;

}


// -----------------------------------------------------
// TAMPILKAN FORM UPLOAD
// -----------------------------------------------------

function tampilkanFormUpload() {

    const form =
        document.getElementById("uploadForm");


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

                const result =
                    reader.result;


                const base64 =
                    result.split(",")[1];


                resolve(base64);

            };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "Gagal membaca file"
                        )
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}


// -----------------------------------------------------
// UPLOAD SEMUA FILE
// -----------------------------------------------------

async function uploadSemuaFile() {

    const input =
        document.getElementById("fileInput");


    const status =
        document.getElementById("uploadStatus");


    if (!input || !status) {

        return;

    }


    // -------------------------------------------------
    // CEK FILE
    // -------------------------------------------------

    if (input.files.length === 0) {

        status.innerHTML =
            "❌ Silakan pilih file terlebih dahulu.";

        return;

    }


    // -------------------------------------------------
    // TENTUKAN FOLDER
    // -------------------------------------------------

    const folder =
        getUploadFolder();


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

    for (
        let i = 0;
        i < input.files.length;
        i++
    ) {

        const file =
            input.files[i];


        status.innerHTML =
            "⏳ Upload file " +
            (i + 1) +
            " dari " +
            input.files.length +
            ": " +
            file.name;


        try {

            // -----------------------------------------
            // KONVERSI BASE64
            // -----------------------------------------

            const base64 =
                await fileKeBase64(file);


            // -----------------------------------------
            // DATA KE VERCEL
            // -----------------------------------------

            const data = {

                filename:
                    file.name,

                content:
                    base64,

                folder:
                    folder

            };


            // -----------------------------------------
            // REQUEST
            // -----------------------------------------

            const response =
                await fetch(
                    VERCEL_UPLOAD_API,
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

                throw new Error(

                    result.message ||
                    "Upload gagal"

                );

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

