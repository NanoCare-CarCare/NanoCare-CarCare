//=========================
// Nano Care Digital Passport
//=========================

//-------------------------------------
// بيانات Supabase
//-------------------------------------

const SUPABASE_URL =
  "https://ktouszprkixuihnwfbwq.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b3VzenBya2l4dWlobndmYndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTQ3NTEsImV4cCI6MjA5NDQzMDc1MX0.XatbbruatAENhsFqGXlPqzsdb26_yB182wqgmeMlbXQ";
const client = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


//-------------------------------------
// قراءة vehicle_id من الرابط
//-------------------------------------

const params = new URLSearchParams(
  window.location.search
);

const vehicleId = params.get("id");

console.log("Vehicle ID:", vehicleId);


//-------------------------------------
// لو مفيش ID
//-------------------------------------

if (!vehicleId) {

  document.body.innerHTML = `
    <h2 style="
      color:white;
      text-align:center;
      margin-top:50px;
    ">
      Vehicle ID Not Found
    </h2>
  `;

  throw new Error("Vehicle ID Not Found");
}


//=====================================
// تحميل بيانات Digital Passport
//=====================================

async function loadPassport() {

  try {

    //---------------------------------
    // السيارة
    //---------------------------------

    const {
      data: vehicle,
      error: vehicleError
    } = await client
      .from("vehicles")
      .select("*")
      .eq("id", vehicleId)
      .single();


    if (vehicleError) {

      console.error(
        "Vehicle Error:",
        vehicleError
      );

      return;
    }


    console.log(
      "Vehicle:",
      vehicle
    );


    //---------------------------------
    // العميل
    //---------------------------------

    const {
      data: customer,
      error: customerError
    } = await client
      .from("customers")
      .select("*")
      .eq("id", vehicle.customer_id)
      .single();


    if (customerError) {

      console.error(
        "Customer Error:",
        customerError
      );

    }


    console.log(
      "Customer:",
      customer
    );


    //---------------------------------
    // الخدمات
    //---------------------------------

    const {
      data: requests,
      error: requestsError
    } = await client
      .from("service_requests")
      .select(`
        status,
        services (
          name
        )
      `)
      .eq(
        "customer_id",
        vehicle.customer_id
      );


    if (requestsError) {

      console.error(
        "Services Error:",
        requestsError
      );

    }


    console.log(
      "Requests:",
      requests
    );


    //---------------------------------
    // المستندات
    //---------------------------------

    const {
      data: documents,
      error: documentsError
    } = await client
      .from("vehicle_documents")
      .select("*")
      .eq(
        "vehicle_id",
        vehicleId
      );


    if (documentsError) {

      console.error(
        "Documents Error:",
        documentsError
      );

    }


    console.log(
      "Documents:",
      documents
    );


    //=================================
    // صورة السيارة
    //=================================

    if (vehicle.image_url) {

      const carImage =
        document.getElementById(
          "carImage"
        );

      const imagePlaceholder =
        document.getElementById(
          "imagePlaceholder"
        );


      if (carImage) {

        carImage.src =
          vehicle.image_url;

        carImage.style.display =
          "block";
      }


      if (imagePlaceholder) {

        imagePlaceholder.style.display =
          "none";
      }

    }


    //=================================
    // بيانات السيارة
    //=================================

    const brand =
      document.getElementById("brand");

    const model =
      document.getElementById("model");

    const year =
      document.getElementById("year");

    const color =
      document.getElementById("color");

    const plate =
      document.getElementById("plate");

    const chassis =
      document.getElementById("chassis");


    if (brand)
      brand.innerText =
        vehicle.brand ?? "-";

    if (model)
      model.innerText =
        vehicle.model ?? "-";

    if (year)
      year.innerText =
        vehicle.year ?? "-";

    if (color)
      color.innerText =
        vehicle.color ?? "-";

    if (plate)
      plate.innerText =
        vehicle.plate_number ?? "-";

    if (chassis)
      chassis.innerText =
        vehicle.chassis_number ?? "-";


    //=================================
    // بيانات العميل
    //=================================

    const customerName =
      document.getElementById(
        "customerName"
      );

    const customerPhone =
      document.getElementById(
        "customerPhone"
      );

    const customerAddress =
      document.getElementById(
        "customerAddress"
      );


    if (customerName)
      customerName.innerText =
        customer?.name ?? "-";

    if (customerPhone)
      customerPhone.innerText =
        customer?.phone ?? "-";

    if (customerAddress)
      customerAddress.innerText =
        customer?.address ?? "-";


    //=================================
    // الخدمات
    //=================================

    const servicesDiv =
      document.getElementById(
        "services"
      );


    if (servicesDiv) {

      servicesDiv.innerHTML = "";


      (requests || []).forEach(
        (item) => {

          const div =
            document.createElement(
              "div"
            );


          div.className =
            "service";


          div.innerHTML = `

            <span>
              ${item.services?.name ?? "-"}
            </span>

            <span class="status ${item.status}">
              ${translateStatus(
                item.status
              )}
            </span>

          `;


          servicesDiv.appendChild(
            div
          );

        }
      );

    }


    //=================================
    // المستندات والشهادات
    //=================================

    const documentsDiv =
      document.getElementById(
        "documents"
      );


    if (documentsDiv) {

      documentsDiv.innerHTML = "";


      if (
        Array.isArray(documents)
      ) {

        documents.forEach(
          (doc) => {

            // document
            if (
              doc.type === "document"
            ) {

              documentsDiv.innerHTML += `

                <div class="service">

                  <span>
                    ${doc.document_title ?? "-"}
                  </span>

                  <a
                    href="${doc.file_url}"
                    target="_blank"
                    class="status finished"
                  >
                    عرض
                  </a>

                </div>

              `;

            }


            // certificate
            else if (
              doc.type === "certificate"
            ) {

              documentsDiv.innerHTML += `

                <div class="service">

                  <span>
                    ${doc.document_title ?? "-"}
                  </span>

                  <a
                    href="${doc.file_url}"
                    target="_blank"
                    class="status finished"
                  >
                    عرض
                  </a>

                </div>

              `;

            }

          }
        );

      }

    }


    //=================================
    // جدول الصيانة
    //=================================

    const maintenanceDiv =
      document.getElementById(
        "maintenance"
      );


    if (maintenanceDiv) {

      maintenanceDiv.innerHTML = "";


      if (
        Array.isArray(documents)
      ) {

        documents.forEach(
          (doc) => {

            if (
              doc.type === "maintenance"
            ) {

              maintenanceDiv.innerHTML += `

                <div class="service">

                  <span>
                    ${doc.document_title ?? "-"}
                  </span>

                  <a
                    href="${doc.file_url}"
                    target="_blank"
                    class="status accepted"
                  >
                    فتح
                  </a>

                </div>

              `;

            }

          }
        );

      }

    }


    console.log(
      "Digital Passport Loaded Successfully"
    );

  }

  catch (error) {

    console.error(
      "Unexpected Error:",
      error
    );

  }

}


//=====================================
// ترجمة حالة الخدمة
//=====================================

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
      return status ?? "-";

  }

}


//=====================================
// تشغيل الصفحة
//=====================================

loadPassport();
