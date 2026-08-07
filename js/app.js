//=========================
// Nano Care Digital Passport
//=========================

// بيانات Supabase
const SUPABASE_URL = "https://ktouszprkixuihnwfbwq.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b3VzenBya2l4dWlobndmYndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTQ3NTEsImV4cCI6MjA5NDQzMDc1MX0.XatbbruatAENhsFqGXlPqzsdb26_yB182wqgmeMlbXQ";

const client = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

//-------------------------------------
// قراءة vehicle_id من الرابط
//-------------------------------------

const params = new URLSearchParams(window.location.search);
const vehicleId = params.get("id");

if (!vehicleId) {
  document.body.innerHTML =
    "<h2 style='color:white;text-align:center;margin-top:50px'>Vehicle ID Not Found</h2>";
  throw new Error("Vehicle ID Not Found");
}

async function loadPassport() {

  //---------------------------------
  // السيارة
  //---------------------------------

  const { data: vehicle, error: vehicleError } = await client
    .from("vehicles")
    .select("*")
    .eq("id", vehicleId)
    .single();

  if (vehicleError) {
    console.log(vehicleError);
    return;
  }

  //---------------------------------
  // العميل
  //---------------------------------

  const { data: customer } = await client
    .from("customers")
    .select("*")
    .eq("id", vehicle.customer_id)
    .single();

  //---------------------------------
  // الخدمات
  //---------------------------------

  const { data: requests } = await client
    .from("service_requests")
    .select(`
      status,
      services(name)
    `)
    .eq("customer_id", vehicle.customer_id);

  //---------------------------------
  // المستندات
  //---------------------------------

  const { data: documents, error: documentsError } = await client
    .from("vehicle_documents")
    .select("*")
    .eq("vehicle_id", vehicleId);

  console.log("Vehicle :", vehicle);
  console.log("Customer :", customer);
  console.log("Requests :", requests);
  console.log("Documents :", documents);

    //---------------------------------
  // صورة السيارة
  //---------------------------------

  if (vehicle.image_url) {
    document.getElementById("carImage").src = vehicle.image_url;
    document.getElementById("carImage").style.display = "block";
    document.getElementById("imagePlaceholder").style.display = "none";
  }

  //---------------------------------
  // بيانات السيارة
  //---------------------------------

  document.getElementById("brand").innerText = vehicle.brand ?? "-";
  document.getElementById("model").innerText = vehicle.model ?? "-";
  document.getElementById("year").innerText = vehicle.year ?? "-";
  document.getElementById("color").innerText = vehicle.color ?? "-";
  document.getElementById("plate").innerText = vehicle.plate_number ?? "-";
  document.getElementById("chassis").innerText = vehicle.chassis_number ?? "-";

  //---------------------------------
  // بيانات العميل
  //---------------------------------

  document.getElementById("customerName").innerText =
    customer?.name ?? "-";

  document.getElementById("customerPhone").innerText =
    customer?.phone ?? "-";

  document.getElementById("customerAddress").innerText =
    customer?.address ?? "-";

  //---------------------------------
  // الخدمات
  //---------------------------------

  const servicesDiv = document.getElementById("services");
  servicesDiv.innerHTML = "";

  (requests || []).forEach((item) => {

    const div = document.createElement("div");

    div.className = "service";

    div.innerHTML = `
      <span>${item.services?.name ?? "-"}</span>

      <span class="status ${item.status}">
        ${translateStatus(item.status)}
      </span>
    `;

    servicesDiv.appendChild(div);

  });

  //---------------------------------
  // المستندات والشهادات
  //---------------------------------

  const documentsDiv = document.getElementById("documents");
  documentsDiv.innerHTML = "";

  //---------------------------------
  // جدول الصيانة
  //---------------------------------

  const maintenanceDiv = document.getElementById("maintenance");
  maintenanceDiv.innerHTML = "";

  (documents || []).forEach((doc) => {

    if (
      doc.type === "document" ||
      doc.type === "certificate"
    ) {

      documentsDiv.innerHTML += `
        <div class="service">
          <span>${doc.document_title}</span>

          <a href="${doc.file_url}"
             target="_blank"
             class="status finished">

             عرض

          </a>
        </div>
      `;

    } else if (doc.type === "maintenance") {

      maintenanceDiv.innerHTML += `
        <div class="service">
          <span>${doc.document_title}</span>

          <a href="${doc.file_url}"
             target="_blank"
             class="status accepted">

             فتح

          </a>
        </div>
      `;

    }

  });

}

function translateStatus(status) {

  switch (status) {

    case "pending":
      return "قيد الانتظار";

    case "accepted":
      return "تم القبول";

    case "finished":
      return "منتهية";

    case "rejected":
      return "مرفوض";

    default:
      return status;

  }

}

loadPassport();
