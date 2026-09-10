
// =====================================================
// URL BACKEND VERCEL
// =====================================================

// GANTI dengan domain Vercel Anda
const VERCEL_API =
    "https://apivga.vercel.app/api/upload";


// =====================================================
// TAMPILKAN FORM
// =====================================================

function tampilkanForm() {

    const form =
        document.getElementById("uploadForm");

    if (form.style.display === "block") {

        form.style.display = "none";

    } else {

        form.style.display = "block";

    }

}


// =====================================================
// PREVIEW FILE
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const fileInput =
        document.getElementById("fileInput");

    if (!fileInput) {
        return;
    }

    fileInput.addEventListener("change", function () {

        const file = this.files[0];

        const preview =
            document.getElementById("preview");

        preview.innerHTML = "";

        if (!file) {
            return;
        }


        // ---------------------------------------------
        // FOTO
        // ---------------------------------------------

        if (file.type.startsWith("image/")) {

            const img =
                document.createElement("img");

            img.src =
                URL.createObjectURL(file);

            img.style.maxWidth = "300px";
            img.style.maxHeight = "250px";
            img.style.marginTop = "10px";

            preview.appendChild(img);

        }


        // ---------------------------------------------
        // VIDEO
        // ---------------------------------------------

        else if (file.type.startsWith("video/")) {

            const video =
                document.createElement("video");

            video.src =
                URL.createObjectURL(file);

            video.controls = true;

            video.style.maxWidth = "300px";
            video.style.maxHeight = "250px";
            video.style.marginTop = "10px";

            preview.appendChild(video);

        }

    });

});


// =====================================================
// UPLOAD GALERI
// =====================================================

async function tambahGaleri() {

    const judul =
        document.getElementById("judul").value.trim();

    const fileInput =
        document.getElementById("fileInput");

    const status =
        document.getElementById("uploadStatus");


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

    if (!fileInput.files.length) {

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
        25 * 1024 * 1024; // 25 MB


    if (file.size > maxSize) {

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
        // BACA FILE
        // -----------------------------------------

        const base64 =
            await fileToBase64(file);


        // -----------------------------------------
        // BUAT NAMA FILE
        // -----------------------------------------

        const extension =
            file.name.includes(".")
            ? file.name.substring(
                file.name.lastIndexOf(".")
              )
            : "";


        const safeJudul =
            judul
                .replace(/[^a-zA-Z0-9-_ ]/g, "")
                .replace(/\s+/g, "_");


        const timestamp =
            Date.now();


        const filename =
            safeJudul +
            "_" +
            timestamp +
            extension;


        // -----------------------------------------
        // DATA UNTUK VERCEL
        // -----------------------------------------

        const data = {

            filename: filename,

            content: base64

        };


        // -----------------------------------------
        // KIRIM KE VERCEL
        // -----------------------------------------

        const response =
            await fetch(
                VERCEL_API,
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

        if (!response.ok || !result.success) {

            console.error(result);

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
        // TAMPILKAN DI GALERI
        // -----------------------------------------

        tampilkanItemBaru(
            judul,
            file,
            result
        );


        // -----------------------------------------
        // RESET FORM
        // -----------------------------------------

        document.getElementById("judul").value =
            "";

        fileInput.value =
            "";

        document.getElementById("preview").innerHTML =
            "";


    }

    catch (error) {

        console.error(error);

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
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = function () {

                // Hasil FileReader:
                // data:image/jpeg;base64,XXXXXX

                // Kita hanya mengambil bagian Base64

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


// =====================================================
// TAMPILKAN ITEM BARU DI GALERI
// =====================================================

function tampilkanItemBaru(
    judul,
    file,
    result
) {

    const galeri =
        document.getElementById("galeri");


    const item =
        document.createElement("div");

    item.className =
        "item";


    // ---------------------------------------------
    // FOTO
    // ---------------------------------------------

    if (file.type.startsWith("image/")) {

        const img =
            document.createElement("img");

        img.src =
            URL.createObjectURL(file);

        img.alt =
            judul;

        item.appendChild(img);

    }


    // ---------------------------------------------
    // VIDEO
    // ---------------------------------------------

    else if (file.type.startsWith("video/")) {

        const video =
            document.createElement("video");

        video.controls =
            true;

        video.src =
            URL.createObjectURL(file);

        item.appendChild(video);

    }


    // ---------------------------------------------
    // JUDUL
    // ---------------------------------------------

    const h3 =
        document.createElement("h3");

    h3.textContent =
        judul;

    item.appendChild(h3);


    // ---------------------------------------------
    // KETERANGAN
    // ---------------------------------------------

    const p =
        document.createElement("p");

    p.textContent =
        "File berhasil disimpan.";

    item.appendChild(p);


    // ---------------------------------------------
    // TAMBAHKAN KE GALERI
    // ---------------------------------------------

    galeri.appendChild(item);

}

