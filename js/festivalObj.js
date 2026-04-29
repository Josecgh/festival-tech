export async function xmlAObjeto(url) {
  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error("Error al cargar el XML");
    
    const textoXml = await respuesta.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(textoXml, "application/xml");

    // 1. Extraer datos generales del festival
    const infoGeneral = {
      nombre: xmlDoc.querySelector("festival > nombre")?.textContent,
      ciudad: xmlDoc.querySelector("ciudad")?.textContent,
      lugar: xmlDoc.querySelector("lugar")?.textContent,
      
      fechas: Array.from(xmlDoc.querySelectorAll("fechas > fecha")).map(f => {
      return {
        dia: f.querySelector("dia")?.textContent,
        mes: f.querySelector("mes")?.textContent,
        num: f.querySelector("num")?.textContent,
        anio: f.querySelector("anio")?.textContent
      };
    })
    };

    const h1Titulo = document.getElementById("title");
    h1Titulo.textContent = infoGeneral.nombre;

    // 2. Extraer las Actividades
    const nodosActividades = xmlDoc.getElementsByTagName("actividad");
    const actividades = Array.from(nodosActividades).map(nodo => ({
      id: nodo.getAttribute("id"),
      tipo: nodo.getAttribute("tipo"),
      titulo: nodo.querySelector("titulo")?.textContent,
      descripcion: nodo.querySelector("descripcion").textContent,
      hora: nodo.querySelector("hora")?.textContent,
      precio: nodo.querySelector("precio")?.textContent
    }));

    const listaActividades = document.getElementById("actividades");

    actividades.forEach(act => {
      const liActividad = document.createElement("li");
      listaActividades.appendChild(liActividad);
      const titleActividad = document.createElement("h3");
      titleActividad.textContent = act.titulo;
      liActividad.appendChild(titleActividad);
      const descripcionActividad = document.createElement("p");
      descripcionActividad.textContent = act.descripcion;
      liActividad.appendChild(descripcionActividad);
      
      const infoPago = document.createElement("p");
      
      infoPago.innerHTML = `<strong>Horario:</strong> ${act.hora} | <strong>Precio:</strong> ${act.precio}`;
      liActividad.appendChild(infoPago);
    });

    // 3. Extraer los Planes
    const nodosPlanes = xmlDoc.getElementsByTagName("plan");
    const planes = Array.from(nodosPlanes).map(nodo => ({
      nombre: nodo.querySelector("nombre")?.textContent,
      precio: nodo.querySelector("precio")?.textContent,
      // Para las ventajas, creamos un array de strings
      ventajas: Array.from(nodo.querySelectorAll("ventaja")).map(v => v.textContent)
    }));

    const scheduleContainer = document.querySelector(".schedule-container");

    if (scheduleContainer && infoGeneral.fechas) {
      // Limpiamos el contenido estático
      scheduleContainer.innerHTML = "";

      infoGeneral.fechas.forEach((f, index) => {
        // Creamos el div principal del día
        const dayDiv = document.createElement("div");
        dayDiv.className = `schedule-day day-${index + 1}`;

        // Nota: He añadido un condicional simple para los textos (INAUGURACIÓN / INNOVACIÓN)
        // basándome en el índice, pero podrías traer esto también desde el XML
        const subtitulo = index === 0 ? "(INAUGURACIÓN)" : "(INNOVACIÓN)";

        dayDiv.innerHTML = `
          <div class="day-header">
            DÍA ${index + 1}: ${f.dia.toUpperCase()}
            <span>${subtitulo}</span>
          </div>
          <div class="day-date">${f.mes} ${f.num}</div>
          <div class="times">
            <div class="time-block aperture">
              APERTURA: <span>09:00 AM</span>
            </div>
            <div class="time-block cierre">
              CIERRE: <span>10:00 PM</span>
            </div>
          </div>
        `;

        scheduleContainer.appendChild(dayDiv);
      });
    }
    // UBICACION
    const lugar = document.getElementById("lugar");
    lugar.textContent = infoGeneral.lugar;
    const ciudad = document.getElementById("ciudad");
    ciudad.textContent = infoGeneral.ciudad;




    // Consolidamos todo en un solo objeto
    const festivalCompleto = {
      ...infoGeneral,
      actividades: actividades,
      planes: planes
    };

    const contenedorPrecios = document.querySelector(".pricing-container");

    if (contenedorPrecios && festivalCompleto.planes) {
      // 1. Limpiamos las tarjetas estáticas
      contenedorPrecios.innerHTML = "";

      festivalCompleto.planes.forEach((plan, index) => {
        const card = document.createElement("article");
        
        // Si es el segundo plan (índice 1), le ponemos la clase 'featured'
        card.className = index === 1 ? "price-card featured" : "price-card";

        // 2. Generamos el HTML de la lista de ventajas
        const listaVentajasHTML = plan.ventajas
          .map(ventaja => `<li>${ventaja}</li>`)
          .join("");

        // 3. Construimos la tarjeta
        card.innerHTML = `
          <div class="price-header">
            ${index === 1 ? '<span class="badge">Recomendado</span>' : ''}
            <h3>${plan.nombre}</h3>
            <p class="amount">${plan.precio}</p>
          </div>
          <ul class="features">
            ${listaVentajasHTML}
          </ul>
          <button class="btn-pay">Comprar ahora</button>
        `;

        contenedorPrecios.appendChild(card);
      });
    }

    console.log("Datos del Festival:", festivalCompleto);
    return festivalCompleto;

  } catch (error) {
    console.error("Error al procesar el XML:", error);
  }
}

xmlAObjeto('./festival.xml');