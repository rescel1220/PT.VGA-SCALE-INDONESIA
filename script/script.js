
// =====================================================
// KONFIGURASI VERCEL
// =====================================================
// GANTI dengan domain Vercel Anda
const VERCEL_BASE_URL ="https://apivga.vercel.app";
// API UPLOAD
const VERCEL_UPLOAD_API =VERCEL_BASE_URL + "/api/upload";
// API LIST
const VERCEL_LIST_API =VERCEL_BASE_URL + "/api/list";
// =====================================================
// DROPDOWN PRODUK
// =====================================================
function toggleDropdown(event) {
    event.preventDefault();
    const dropdown =document.getElementById("produkDropdown");
    if (!dropdown) {
        return;
    }
    if ( dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
}
// =====================================================
// TUTUP DROPDOWN KETIKA KLIK DI LUAR
// =====================================================
document.addEventListener("click",function (event) {
        const dropdown =document.getElementById("produkDropdown");
        const dropdownParent =document.querySelector(".dropdown");
        if (!dropdown || !dropdownParent) {
            return;
        }
        if (!dropdownParent.contains(event.target)) {
            dropdown.style.display = "none";
        }
    }
);
// =====================================================
// TAMPILKAN / SEMBUNYIKAN FORM
// =====================================================

function tampilkanForm() {
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
// PREVIEW FOTO / VIDEO
// =====================================================
document.addEventListener("DOMContentLoaded",function () {
        const fileInput =document.getElementById("fileInput");
        if (!fileInput) {
            return;
        }
        fileInput.addEventListener("change",function () {
                const file =this.files[0];
                const preview =document.getElementById("preview");
                if (!preview) {
                    return;
                }
                preview.innerHTML = "";
                if (!file) {
                    return;
                }
                // -----------------------------------------
                // FOTO
                // -----------------------------------------
                if (file.type.startsWith("image/")) {
                    const img =document.createElement("img");
                    img.src =URL.createObjectURL(file);
                    img.style.maxWidth ="300px";
                    img.style.maxHeight ="250px";
                    img.style.marginTop ="10px";
                    preview.appendChild(img);
                }
                // -----------------------------------------
                // VIDEO
                // -----------------------------------------
                else if (file.type.startsWith("video/")) {
                    const video =document.createElement("video");
                    video.src =URL.createObjectURL(file);
                    video.controls =true;
                    video.style.maxWidth ="300px";
                    video.style.maxHeight ="250px";
                    video.style.marginTop ="10px";
                    preview.appendChild(video);
                }
            }
        );
        // =================================================
        // OTOMATIS LOAD GALERI
        // =================================================
        loadGaleri();
    }
);
// =====================================================
// LOAD GALERI DARI GITHUB
// =====================================================
async function loadGaleri() {
    const galeri =document.getElementById("galeri");
    if (!galeri) {
        return;
    }
    // ---------------------------------------------
    // TAMPILKAN STATUS LOADING
    // ---------------------------------------------
    galeri.innerHTML ="<p>⏳ Memuat galeri...</p>";
    try {
        // -----------------------------------------
        // REQUEST KE API LIST
        // -----------------------------------------
        const response =await fetch(VERCEL_LIST_API);
        const result =await response.json();
        console.log("Data galeri:",result);
        // -----------------------------------------
        // CEK RESPONSE
        // -----------------------------------------
        if ( !response.ok || !result.success) {
            throw new Error(result.message || "Gagal membaca galeri");
        }
        // -----------------------------------------
        // KOSONGKAN GALERI
        // -----------------------------------------
        galeri.innerHTML = "";
        // -----------------------------------------
        // JIKA TIDAK ADA FILE
        // -----------------------------------------
        if (!result.files || result.files.length === 0) {
            galeri.innerHTML ="<p>Belum ada foto atau video.</p>";
            return;
        }
        // -----------------------------------------
        // TAMPILKAN SEMUA FILE
        // -----------------------------------------
        result.files.forEach(function (file) {
                tampilkanFileGaleri(
                    file
                );
            }
        );
    } catch (error) {
        console.error("Error load galeri:", error);
        galeri.innerHTML = "<p>❌ Gagal memuat galeri: " + error.message + "</p>";
    }
}
// =====================================================
// TAMPILKAN SATU FILE DI GALERI
// =====================================================
function tampilkanFileGaleri(file) {
    const galeri = document.getElementById("galeri");
    if (!galeri) {
        return;
    }
    // ---------------------------------------------
    // BUAT ITEM
    // ---------------------------------------------
    const item = document.createElement("div");
    item.className ="item";
    // ---------------------------------------------
    // NAMA FILE
    // ---------------------------------------------
    const namaFile =file.name || "";
    const extension =
        namaFile
            .split(".")
            .pop()
            .toLowerCase();
    // ---------------------------------------------
    // FOTO
    // ---------------------------------------------
    const imageExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "bmp",
        "svg"

    ];


    if (imageExtensions.includes(extension)) {
        const img = document.createElement("img");
        img.src =file.download_url;
        img.alt =namaFile;
        img.loading ="lazy";
        item.appendChild(img);
    }
    // ---------------------------------------------
    // VIDEO
    // ---------------------------------------------
    const videoExtensions = [

        "mp4",
        "webm",
        "ogg",
        "mov"

    ];


    if (videoExtensions.includes(extension)) {
        const video =document.createElement("video");
        video.src =file.download_url;
        video.controls =true;
        video.preload ="metadata";
        item.appendChild(video);
    }
    // ---------------------------------------------
    // JUDUL
    // ---------------------------------------------
    const h3 =document.createElement("h3");
    // Nama file sebagai judul
    h3.textContent =namaFile;
    item.appendChild(h3);
    // ---------------------------------------------
    // KETERANGAN
    // ---------------------------------------------
    const p = document.createElement("p");
    p.textContent = "";
    item.appendChild( p );
    // ---------------------------------------------
    // LINK FILE
    // ---------------------------------------------
    const link =document.createElement("a");
    link.href =file.download_url;
    link.target ="_blank";
    link.textContent = "Buka file";
    item.appendChild(link);
    // ---------------------------------------------
    // MASUKKAN KE GALERI
    // ---------------------------------------------
    galeri.appendChild(item);
}
// =====================================================
// UPLOAD GALERI
// =====================================================
async function tambahGaleri() {
    const judul =
        document
            .getElementById("judul")
            .value
            .trim();


    const fileInput =
        document.getElementById(
            "fileInput"
        );


    const status =
        document.getElementById(
            "uploadStatus"
        );



    // ---------------------------------------------
    // CEK JUDUL
    // ---------------------------------------------

    if (!judul) {

        status.innerHTML =
            "❌ Judul belum diisi.";

        return;

    }



    // ---------------------------------------------
    // CEK FILE
    // ---------------------------------------------

    if (
        !fileInput.files.length
    ) {

        status.innerHTML =
            "❌ Silakan pilih foto atau video.";

        return;

    }


    const file =
        fileInput.files[0];



    // ---------------------------------------------
    // BATAS UKURAN
    // ---------------------------------------------

    const maxSize =
        25 * 1024 * 1024;


    if (
        file.size > maxSize
    ) {

        status.innerHTML =
            "❌ Ukuran file maksimal 25 MB.";

        return;

    }



    // ---------------------------------------------
    // STATUS
    // ---------------------------------------------

    status.innerHTML =
        "⏳ Sedang mengupload...";


    try {


        // -----------------------------------------
        // FILE → BASE64
        // -----------------------------------------

        const base64 =
            await fileToBase64(
                file
            );



        // -----------------------------------------
        // EXTENSION
        // -----------------------------------------

        const extension =
            file.name.includes(".")
            ? file.name.substring(
                file.name.lastIndexOf(".")
              )
            : "";



        // -----------------------------------------
        // NAMA FILE AMAN
        // -----------------------------------------

        const safeJudul =
            judul
                .replace(
                    /[^a-zA-Z0-9-_ ]/g,
                    ""
                )
                .replace(
                    /\s+/g,
                    "_"
                );



        // -----------------------------------------
        // TIMESTAMP
        // -----------------------------------------

        const timestamp =
            Date.now();



        // -----------------------------------------
        // NAMA FILE
        // -----------------------------------------

        const filename =
            safeJudul +
            "_" +
            timestamp +
            extension;



        // -----------------------------------------
        // DATA
        // -----------------------------------------

        const data = {

            filename:
                filename,

            content:
                base64

        };



        // -----------------------------------------
        // KIRIM KE VERCEL
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
                        JSON.stringify(
                            data
                        )

                }
            );



        // -----------------------------------------
        // RESPONSE
        // -----------------------------------------

        const result =
            await response.json();



        // -----------------------------------------
        // CEK
        // -----------------------------------------

        if (
            !response.ok ||
            !result.success
        ) {

            console.error(
                result
            );


            throw new Error(
                result.message ||
                "Upload gagal"
            );

        }



        // -----------------------------------------
        // BERHASIL
        // -----------------------------------------

        status.innerHTML =
            "✅ File berhasil diupload ke GitHub!";



        // -----------------------------------------
        // RESET FORM
        // -----------------------------------------

        document
            .getElementById("judul")
            .value = "";


        fileInput.value =
            "";


        const preview =
            document.getElementById(
                "preview"
            );


        if (preview) {

            preview.innerHTML =
                "";

        }



        // -----------------------------------------
        // LOAD ULANG GALERI
        // -----------------------------------------

        await loadGaleri();



    } catch (error) {

        console.error(
            error
        );


        status.innerHTML =
            "❌ Upload gagal: " +
            error.message;

    }

}



// =====================================================
// FILE → BASE64
// =====================================================

function fileToBase64(file) {

    return new Promise(
        function (
            resolve,
            reject
        ) {

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    const result =
                        reader.result;


                    const base64 =
                        result.split(",")[1];


                    resolve(
                        base64
                    );

                };


            reader.onerror =
                function () {

                    reject(

                        new Error(
                            "Gagal membaca file"
                        )

                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}





// =====================================================
// MANUAL BOOK
// =====================================================

// -----------------------------------------------------
// TAMPILKAN / SEMBUNYIKAN FORM MANUAL BOOK
// -----------------------------------------------------

function tampilkanFormManual() {

    const form =
        document.getElementById(
            "manualUploadForm"
        );

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
// PREVIEW / INFORMASI FILE MANUAL BOOK
// -----------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const manualInput =
            document.getElementById(
                "manualFileInput"
            );


        if (!manualInput) {
            return;
        }


        manualInput.addEventListener(
            "change",
            function () {

                const file =
                    this.files[0];


                const preview =
                    document.getElementById(
                        "manualPreview"
                    );


                if (!preview) {
                    return;
                }


                preview.innerHTML = "";


                if (!file) {
                    return;
                }


                // -----------------------------------------
                // EXTENSION
                // -----------------------------------------

                const extension =
                    file.name
                        .substring(
                            file.name.lastIndexOf(".")
                        )
                        .toLowerCase();


                // -----------------------------------------
                // FILE YANG DIIZINKAN
                // -----------------------------------------

                const allowedExtensions = [

                    ".txt",
                    ".pdf",
                    ".csv",
                    ".docx"

                ];


                if (
                    !allowedExtensions.includes(
                        extension
                    )
                ) {

                    preview.innerHTML =
                        "❌ File tidak diizinkan. " +
                        "Gunakan .txt, .pdf, .csv atau .docx.";

                    manualInput.value = "";

                    return;

                }


                // -----------------------------------------
                // INFORMASI FILE
                // -----------------------------------------

                const info =
                    document.createElement(
                        "p"
                    );


                info.textContent =
                    "📄 " +
                    file.name +
                    " (" +
                    formatFileSize(file.size) +
                    ")";


                preview.appendChild(
                    info
                );

            }
        );

    }
);



// -----------------------------------------------------
// FORMAT UKURAN FILE
// -----------------------------------------------------

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }


    if (bytes < 1024 * 1024) {

        return (
            (bytes / 1024).toFixed(1) +
            " KB"
        );

    }


    return (
        (bytes / (1024 * 1024)).toFixed(1) +
        " MB"
    );

}



// =====================================================
// UPLOAD MANUAL BOOK
// =====================================================

async function uploadManualBook() {

    const judul =
        document
            .getElementById(
                "manualJudul"
            )
            .value
            .trim();


    const fileInput =
        document.getElementById(
            "manualFileInput"
        );


    const status =
        document.getElementById(
            "manualUploadStatus"
        );


    // ---------------------------------------------
    // CEK JUDUL
    // ---------------------------------------------

    if (!judul) {

        status.innerHTML =
            "❌ Judul belum diisi.";

        return;

    }


    // ---------------------------------------------
    // CEK FILE
    // ---------------------------------------------

    if (
        !fileInput.files.length
    ) {

        status.innerHTML =
            "❌ Silakan pilih file Manual Book.";

        return;

    }


    const file =
        fileInput.files[0];


    // ---------------------------------------------
    // CEK EXTENSION
    // ---------------------------------------------

    const extension =
        file.name
            .substring(
                file.name.lastIndexOf(".")
            )
            .toLowerCase();


    const allowedExtensions = [

        ".txt",
        ".pdf",
        ".csv",
        ".docx"

    ];


    if (
        !allowedExtensions.includes(
            extension
        )
    ) {

        status.innerHTML =
            "❌ File tidak diizinkan. " +
            "Gunakan .txt, .pdf, .csv atau .docx.";

        return;

    }


    // ---------------------------------------------
    // BATAS UKURAN
    // ---------------------------------------------
    //
    // Untuk sementara kita gunakan 25 MB,
    // sama seperti Foto/Video.
    //

    const maxSize =
        25 * 1024 * 1024;


    if (
        file.size > maxSize
    ) {

        status.innerHTML =
            "❌ Ukuran file maksimal 25 MB.";

        return;

    }


    // ---------------------------------------------
    // STATUS
    // ---------------------------------------------

    status.innerHTML =
        "⏳ Sedang mengupload...";


    try {


        // -----------------------------------------
        // FILE → BASE64
        // -----------------------------------------

        const base64 =
            await fileToBase64(
                file
            );


        // -----------------------------------------
        // NAMA FILE AMAN
        // -----------------------------------------

        const safeJudul =
            judul
                .replace(
                    /[^a-zA-Z0-9-_ ]/g,
                    ""
                )
                .replace(
                    /\s+/g,
                    "_"
                );


        // -----------------------------------------
        // TIMESTAMP
        // -----------------------------------------

        const timestamp =
            Date.now();


        // -----------------------------------------
        // NAMA FILE
        // -----------------------------------------

        const filename =
            safeJudul +
            extension;


        // -----------------------------------------
        // DATA
        // -----------------------------------------

        const data = {

            filename:
                filename,

            content:
                base64,

            type:
                "manual"

        };


        // -----------------------------------------
        // KIRIM KE VERCEL
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
                        JSON.stringify(
                            data
                        )

                }
            );


        // -----------------------------------------
        // RESPONSE
        // -----------------------------------------

        const result =
            await response.json();


        // -----------------------------------------
        // CEK RESPONSE
        // -----------------------------------------

        if (
            !response.ok ||
            !result.success
        ) {

            console.error(
                result
            );


            throw new Error(
                result.message ||
                result.error ||
                "Upload gagal"
            );

        }


        // -----------------------------------------
        // BERHASIL
        // -----------------------------------------

        status.innerHTML =
            "✅ Manual Book berhasil diupload ke GitHub!";


        // -----------------------------------------
        // RESET
        // -----------------------------------------

        document
            .getElementById(
                "manualJudul"
            )
            .value = "";


        fileInput.value = "";


        const preview =
            document.getElementById(
                "manualPreview"
            );


        if (preview) {

            preview.innerHTML =
                "";

        }


        // -----------------------------------------
        // LOAD ULANG MANUAL BOOK
        // -----------------------------------------

        await loadManualBook();


    }
    catch (error) {

        console.error(
            "Error upload Manual Book:",
            error
        );


        status.innerHTML =
            "❌ Upload gagal: " +
            error.message;

    }

}



// =====================================================
// LOAD MANUAL BOOK
// =====================================================

async function loadManualBook() {

    const list =
        document.getElementById(
            "manualBookList"
        );


    if (!list) {
        return;
    }


    list.innerHTML =
        "<p>⏳ Memuat Manual Book...</p>";


    try {


        // -----------------------------------------
        // REQUEST API LIST
        // -----------------------------------------

        const response =
            await fetch(
                VERCEL_LIST_API +
                "?type=manual"
            );


        const result =
            await response.json();


        console.log(
            "Data Manual Book:",
            result
        );


        // -----------------------------------------
        // CEK RESPONSE
        // -----------------------------------------

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                result.error ||
                "Gagal membaca Manual Book"
            );

        }


        // -----------------------------------------
        // KOSONG
        // -----------------------------------------

        list.innerHTML = "";


        if (
            !result.files ||
            result.files.length === 0
        ) {

            list.innerHTML =
                "<p>Belum ada Manual Book.</p>";

            return;

        }


        // -----------------------------------------
        // TAMPILKAN
        // -----------------------------------------

        result.files.forEach(
            function (file) {

                tampilkanManualBook(
                    file
                );

            }
        );


    }
    catch (error) {

        console.error(
            "Error load Manual Book:",
            error
        );


        list.innerHTML =
            "<p>❌ Gagal memuat Manual Book: " +
            error.message +
            "</p>";

    }

}



// =====================================================
// TAMPILKAN SATU MANUAL BOOK
// =====================================================

function tampilkanManualBook(file) {

    const list =
        document.getElementById(
            "manualBookList"
        );


    if (!list) {
        return;
    }


    const item =
        document.createElement(
            "div"
        );


    item.className =
        "item";


    const namaFile =
        file.name || "";


    // ---------------------------------------------
    // EXTENSION
    // ---------------------------------------------

    const extension =
        namaFile
            .split(".")
            .pop()
            .toLowerCase();


    // ---------------------------------------------
    // ICON
    // ---------------------------------------------

    const icon =
        document.createElement(
            "div"
        );


    icon.style.fontSize =
        "50px";


    if (extension === "pdf") {

        icon.textContent =
            "📕";

    }
    else if (extension === "docx") {

        icon.textContent =
            "📘";

    }
    else if (extension === "csv") {

        icon.textContent =
            "📊";

    }
    else if (extension === "txt") {

        icon.textContent =
            "📄";

    }
    else {

        icon.textContent =
            "📁";

    }


    item.appendChild(
        icon
    );


    // ---------------------------------------------
    // NAMA FILE
    // ---------------------------------------------

    const h3 =
        document.createElement(
            "h3"
        );


    h3.textContent =
        namaFile;


    item.appendChild(
        h3
    );


    // ---------------------------------------------
    // JENIS FILE
    // ---------------------------------------------

    const p =
        document.createElement(
            "p"
        );


    p.textContent =
        "Manual Book • ." +
        extension;


    item.appendChild(
        p
    );


    // ---------------------------------------------
    // LINK BUKA
    // ---------------------------------------------

    const link =
        document.createElement(
            "a"
        );


    link.href =
        file.download_url;


    link.target =
        "_blank";


    link.textContent =
        "Buka file";


    item.appendChild(
        link
    );


    // ---------------------------------------------
    // LINK DOWNLOAD
    // ---------------------------------------------

    const download =
        document.createElement(
            "a"
        );


    download.href =
        file.download_url;


    download.download =
        namaFile;


    download.textContent =
        "Download";


    download.style.marginLeft =
        "10px";


    item.appendChild(
        download
    );


    // ---------------------------------------------
    // MASUKKAN KE LIST
    // ---------------------------------------------

    list.appendChild(
        item
    );

}



// =====================================================
// LOAD MANUAL BOOK OTOMATIS
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadManualBook();

    }
);




