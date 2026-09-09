function toggleDropdown(event) {
    event.preventDefault();

    const dropdown = document.getElementById("produkDropdown");

    dropdown.classList.toggle("show");
}


       /* TAMPILKAN FORM */
        function tampilkanForm() {

            const form = document.getElementById("uploadForm");

            if (form.style.display === "none" || form.style.display === "") {
                form.style.display = "block";
            } else {
                form.style.display = "none";
            }

        }


        /* TAMBAH FOTO / VIDEO */
        function tambahGaleri() {

            const judul = document.getElementById("judul").value;
            const fileInput = document.getElementById("fileInput");

            if (judul === "") {
                alert("Masukkan judul terlebih dahulu.");
                return;
            }

            if (fileInput.files.length === 0) {
                alert("Pilih foto atau video terlebih dahulu.");
                return;
            }

            const file = fileInput.files[0];

            const fileURL = URL.createObjectURL(file);

            const item = document.createElement("div");

            item.className = "item";


            /* JIKA FOTO */
            if (file.type.startsWith("image/")) {

                item.innerHTML = `
                    <img src="${fileURL}" alt="${judul}">
                    <h3>${judul}</h3>
                    <p>${file.name}</p>
                `;

            }


            /* JIKA VIDEO */
            else if (file.type.startsWith("video/")) {

                item.innerHTML = `
                    <video controls>
                        <source src="${fileURL}" type="${file.type}">
                    </video>
                    <h3>${judul}</h3>
                    <p>${file.name}</p>
                `;

            }


            else {

                alert("File harus berupa foto atau video.");
                return;

            }


            /* MASUKKAN KE GALERI */
            document.getElementById("galeri").appendChild(item);


            /* RESET FORM */
            document.getElementById("judul").value = "";
            document.getElementById("fileInput").value = "";

        }
