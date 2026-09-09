let currentPage = 0;
let currentSearch = "";
let currentJenis = "";




function tambahvalue(jenis) {
        let box = document.getElementById("search_box");
    if (box) {
        box.style.display = "none";
    }

    let html = "";
if (jenis === "operator") {
 html = `
    <table id="tblOperator">
        <tr>
            <th>ID Operator</th>
            <th>Nama Operator</th>
        </tr>
    `;
}
else if (jenis === "produk") {
    html = `
    <table id="tblProduk">
        <tr>
            <th>ID Produk</th>
            <th>Nama Produk</th>
        </tr>
    `;

}
    for (let i = 0; i < 10; i++) {
        html += `
        <tr>
            <td>
                <input type="text" class="id"
                       style="width:100%;padding:5px;">
            </td>
            <td>
                <input type="text" class="nama"
                       style="width:100%;padding:5px;">
            </td>
        </tr>`;
    }

    html += `
    </table><br>
     <button onclick="savedata('${jenis}')" class="btn">
        Save
    </button>`;

    document.getElementById("result").innerHTML = html;

}


function savedata(jenis) {
    let ids = document.getElementsByClassName("id");
    let nama = document.getElementsByClassName("nama");

    let cmd =
        (jenis === "operator")
        ? "save_operator"
        : "save_produk";

    let data = "cmd=" + cmd;

    for (let i = 0; i < ids.length; i++) {
        let id = ids[i].value.trim();
        let nm = nama[i].value.trim();

        if (id !== "" && nm !== "") {
            data += "&id" + i + "=" + encodeURIComponent(id);
            data += "&nama" + i + "=" + encodeURIComponent(nm);
        }
    }

    fetch('/action', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
    });
    alert("saved!");
    viewAll(jenis, currentPage);
}


function kirimCmd(cmd) {//untuk atur buka halaman
    fetch('/action', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'cmd=' + cmd
    })
    .then(response => response.text())
    .then(data => {
          document.querySelector(".content").innerHTML = data;
    })
    .catch(err => {
        document.getElementById("status").innerText = "Error!";
    });
}

function deleteData(kode, jenis) {
    if (!confirm("Yakin hapus data?")) return;
    let data = `cmd=delete&kode=${encodeURIComponent(kode)}&jenis=${jenis}`;
    fetch("/action", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: data
    })
    .then(res => res.text())
    .then(res => {
        //viewAll(jenis); // reload sesuai tabel
    viewAll(jenis, currentPage);
    })
    .catch(err => {
        alert("Error: " + err);
    });
}

function editData(id, kode, nama, jenis)
{
    let td = document.getElementById("nama_" + id);
    let oldNama = td.innerText;
    // ambil nama dari tampilan (lebih aman)
    nama = td.innerText;
  td.setAttribute("data-old", oldNama);

    td.innerHTML =
        "<div style='display:flex;align-items:center;gap:4px;'>" +
        "<input type='text' id='edit_" + id + "' value=\"" + oldNama + "\" style='width:70%;'>" +
        "<button onclick='saveEdit(\"" + kode + "\",\"" + jenis + "\"," + id + ")'>Save</button>" +
        "<button onclick='cancelEdit(" + id + ")'>No</button>" +
        "</div>";
}

function cancelEdit(id)
{
    let td = document.getElementById("nama_" + id);
    let oldNama = td.getAttribute("data-old");
    td.innerHTML = oldNama;  // ⬅️ balik jadi text
}

function saveEdit(kode, jenis, id) {
    let val = document.getElementById("edit_" + id).value;
    let data =
        "cmd=edit" +
        "&kode=" + encodeURIComponent(kode) +
        "&nama=" + encodeURIComponent(val) +
        "&jenis=" + jenis;

    fetch("/action", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: data
    })
    .then(res => res.text())
    .then(res => {
        alert("Updated!");
        viewAll(jenis, currentPage);
    });
}

function send(jenis) {
    let dataGabung="";

     if (jenis === "baud") {
       let printer = document.getElementById("baud_printer").value;
       let scale   = document.getElementById("baud_scale").value;
       dataGabung = "cmd=baca&printer=" + printer + "&scale=" + scale;
    }
    else if (jenis === "update") {
        dataGabung = "cmd=update";
    }
    else if (jenis === "import_produk") {
        dataGabung = "cmd=import_produk";
        viewAll(jenis);
    }
    else if (jenis === "import_op") {
        dataGabung = "cmd=import_op";
    }
    else if (jenis === "wifi") {
        let ssid = document.getElementById("ssid").value;
        let password = document.getElementById("wifi_pass").value;
        dataGabung = "cmd=wifi&ssid=" + ssid + "&password=" + password;

    }
    else if (jenis === "ota") {
        let ota_ip = document.getElementById("ota_ip").value;
        let ota_port = document.getElementById("ota_port").value;
        let ota_file = document.getElementById("ota_file").value;
        dataGabung = "cmd=ota&ota_ip=" + ota_ip + "&ota_port=" + ota_port + "&ota_file=" + ota_file;
    }
 
    fetch('/action', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: dataGabung
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById("status").innerHTML = data;
        if (jenis === "produk") {
            alert("Product Saved!");
            document.getElementById("product_id").value = "";
            document.getElementById("nama_product").value = "";
            document.getElementById("search_box").style.display = "block";
           // window.location.href = "/";
        viewAll(jenis);   
        }
          if (jenis === "operator" ) {
            alert(data);
            document.getElementById("operator_id").value = "";
            document.getElementById("nama_operator").value = "";

            // tampilkan search box
            document.getElementById("search_box").style.display = "block";
            viewAll(jenis);
        }else if (jenis === "baud") {
            alert("Baud Rate has been updated!");
            window.location.href = "/";
        }else if (jenis === "wifi") {
            alert("WiFi Settings has been updated!");
            window.location.href = "/";
        }


    })
    .catch(err => {
       document.getElementById("status").innerText = "Error!";
    });

   return false; // ❗ penting supaya form tidak reload
}


function viewAll(jenis, page = 0, useSearch = false)
{
    currentPage = page;
    
    // tampilkan search box
    document.getElementById("search_box").style.display = "block";
    let cmd = "";
    if (jenis === "operator") {
        cmd = "view_op";    
    }
    else if (jenis === "produk") {
        cmd = "view_produk";
    }
    else if (jenis === "import_op") {
        cmd = "import_op";
    }
    else if (jenis === "import_produk") {
        cmd = "import_produk";
    }
    else if(jenis === "batch"){
        cmd = "view_batch";
    }
    // =========================
    // ambil isi search
    // =========================
        let key = "";
    if (useSearch) {
        key = document.getElementById("search").value;
    }

    // =========================
    // POST DATA
    // =========================
    let data =
        "cmd=" + cmd +
        "&page=" + page +
        "&search=" + encodeURIComponent(key);

    console.log(data);

    fetch("/action",
    {
        method: "POST",

        headers:
        {
            "Content-Type":
            "application/x-www-form-urlencoded"
        },

        body: data
    })

    .then(response => response.text())

    .then(data =>
    {
        document.getElementById("result").innerHTML = data;
    })

    .catch(err =>
    {
        console.log(err);
    });
}

function searchData(jenis)
{
    viewAll(jenis, 0, true);
}

function downloadBatch(batch = null)
{
    console.log("Batch:", batch);

    if (!batch) {
        batch = document.getElementById("no_batch").value.trim();
    }

    if (!batch) {
        alert("No batch kosong");
        return false;
    }
    if (!batch.startsWith("batch_")) {
        batch = "batch_" + batch;
    }

    window.location.href =
        "/download?no_batch=" + encodeURIComponent(batch);

    return false;
}
///////////////////////TAMPILAN WEIGHING
function updateData(data)
{
    document.getElementById("berat").innerHTML    = data.berat;
    document.getElementById("operator").innerHTML = data.operator;
    document.getElementById("batch").innerHTML    = data.batch;
    document.getElementById("produk").innerHTML   = data.produk;
    document.getElementById("counter").innerHTML  = data.counter;
}


function loadData()
{
    fetch('/data')
    .then(response => response.json())
    .then(data => {

        updateData(data);

    })
    .catch(error => {

        console.log("ERROR :", error);

    });
}


// load pertama
loadData();

// refresh tiap 1 detik
setInterval(loadData, 1000);
///////////////////////////////



function login() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    if(user === "admin" && pass === "rcl123"){
        sessionStorage.setItem("login", "ok_RCL");
        showApp();
    } else {
        alert("Username / Password salah");
    }
}

function showApp(){
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainApp").style.display = "flex";
}

window.onload = function(){
    if(sessionStorage.getItem("login") === "ok_RCL"){
        showApp();
    }
}

function logout(){
    sessionStorage.removeItem("login");
    location.reload();
}
