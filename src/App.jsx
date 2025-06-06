import { useState } from "react";
import ExcelReport from "./components/ExcelReport";
import axios from "axios";
import moment from "moment";
import { BarLoader } from "react-spinners";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [botonHabilitado] = useState(false);
  const [data, setData] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [numeroValor, setNumeroValor] = useState("");
  const [tipoCola, setTipoCola] = useState("");
  const [loading, setLoading] = useState(false);
  const [habilitado, setHabilitado] = useState(true);
  const [fechaConcatenada, setFechaConcatenada] = useState("");
  const [enableDaySelection] = useState(false);
  const [datos, setDatos] = useState("");

  const currentDate = new Date();
  const esPrimerDiaDelMes = currentDate.getDate() !== 1;

  const handleFechaInicioChange = (event) => {
    const nuevaFecha = event.target.value;
    setFechaInicio(nuevaFecha);
    setHabilitado(esMesActual(nuevaFecha) && esPrimerDiaDelMes);
  };

  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
  };
  const handleTipoColaChange = (event) => {
    setTipoCola(event.target.value);
  };

  //consulta acorde a la elccion
  const handleButtonClick = () => {
    // Verificar la opción seleccionada y ejecutar el método correspondiente
    if (selectedOption === "ReporteGeneral") {
      if (fechaInicio !== "") {
        unificarValores();
        //  setFechaInicio(resultado);
        fetchDataFromApiGeneral();
      } else {
        window.alert("Debe escojer una fecha valida valida");
      }
    } else if (selectedOption === "ReporteGestion") {
      if (fechaInicio !== "") {
        // fetchDataFromApiGestion();
      } else {
        window.alert("Debe escojer una fecha valida valida");
      }
    } else {
      window.alert("Debe escojer una opcion valida");
      // Manejar otros casos o mostrar un mensaje de error
      console.error("Opción no válida");
    }
  };

  const fetchDataFromApiGeneral = async () => {
    try {
      setLoading(true);
      unificarValores();

      if (fechaConcatenada.length > 5) {
        var valorConcatenado =
          fechaInicio.length > 7
            ? fechaInicio + "-0" + numeroValor
            : fechaInicio + "-" + numeroValor;
        setFechaInicio(valorConcatenado);

        console.log(fechaInicio);
      }
      const inputData = {
        fechaInicio,
        tipoCola,
        fechaConcatenada,
      };

      const response = await axios.post(
        "http://192.27.0.4:9099/report/generate",
        inputData
      );
      if (response.data !== 0) {
        setApiData(response.data, "ReporteSaludsaGeneral.xlsx");

        setDatos(response.data);
        window.alert("¡informacion generada con exito!");
      } else {
        window.alert("NO se genero la información correctamente");
      }
      setFechaInicio("");
      setNumeroValor("");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    // Guardar el archivo seleccionado en el estado
    setFile(event.target.files[0]);
  };

  //carga de archivo excel
  const handleApiCall = async () => {
    try {
      setLoading(true);
      // Verificar si se ha seleccionado un archivo
      if (!file) {
        window.alert(
          "Por favor, selecciona un archivo antes de realizar la llamada a la API."
        );

        return;
      }

      // Crear un objeto FormData para enviar el archivo a la API
      const formData = new FormData();
      formData.append("file", file);

      // Realizar la llamada a la API utilizando axios
      const response = await axios.post(
        "http://192.27.0.4:9099/llamadas/upload",
        formData
      );
      window.alert("el archivo fue cargado correctamente");

      // Manejar la respuesta de la API
      setApiResponse(response.data);
      console.log(response.data);
      // Verifica si la respuesta fue exitosa (código de estado 2xx)
      if (response.ok) {
        const data = await response.json();
        // Realiza acciones con los datos recibidos
        window.alert("archivo cargado");
        console.log("Datos recibidos:", data);
      } else {
        // Si la respuesta fue un error, captura el mensaje de error
        const errorData = await response.json();
        errorData;

        console.error("Error en la respuesta:", errorData);
      }

      setApiError(null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch("http://192.27.0.4:9099/utils/lastDate");

      const result = await response.text();
      const stringWithoutSpacesAndBrackets = result
        .trim()
        .replace(/[\\"\\[\]]/g, "");

      // Parsear la fecha recibida en el formato dado
      const fecha = moment(
        stringWithoutSpacesAndBrackets,
        "M/D/YYYY h:mm:ss A"
      );

      // Formatear la fecha en el formato de 24 horas
      const fechaFormateada = fecha.format("YYYY-M-D H:mm:ss");

      console.log(fechaFormateada); // Output: "2/22/2024 15:20:55"

      setData(fechaFormateada);

      window.alert("consulta realizada con exito");
    } catch (error) {
      window.alert("No se pudo realizar la consulta");

      console.error("Error al obtener datos:", error);
    }
  };

  const esMesActual = (fechaInput) => {
    const fechaActual = new Date();
    var resultado = false;
    var año = fechaActual.getFullYear();
    var mes = fechaActual.getMonth() + 1;
    var dia = fechaActual.getDate();

    var fechaFormateadaActual =
      año +
      "-" +
      (mes < 10 ? "0" : "") +
      mes +
      "-" +
      (dia < 10 ? "0" : "") +
      dia;

    var partes = fechaInput.split("-");
    var valorEntreGuiones = partes[1];
    var partesActual = fechaFormateadaActual.split("-");
    var valorEntreGuionesActual = partesActual[1];

    if (partes[0] === partesActual[0]) {
      resultado = valorEntreGuionesActual === valorEntreGuiones;
    }
    if (!resultado) {
      setNumeroValor("");
    }

    return resultado;
  };

  const unificarValores = () => {
    var resultadoConcatenado;
    if (numeroValor <= 9) {
      resultadoConcatenado = fechaInicio + "-0" + numeroValor;
    } else {
      resultadoConcatenado = fechaInicio + "-" + numeroValor;
    }

    console.log("fecha", fechaInicio, " numero ", numeroValor);
    console.log(resultadoConcatenado);
    if (numeroValor === "") {
      setFechaConcatenada(fechaInicio);
    } else {
      setFechaConcatenada(resultadoConcatenado);
    }
  };
  return (
    <>
      <div>
        <div className="title">
          <h1 className="block text-indigo-700 text-center  font-bold  ">
            GENERADOR DE REPORTES
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-4 place-content-center h-auto w-auto">
          {/*Filtros fechas*/}
          <div className=" h-80 bg-indigo-300">
            <div className="App flex flex-row">
              <div className="container">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={fetchData}
                >
                  Fecha de la última actualización:
                </button>
                <label className="block text-indigo-950 text-center text-lg font-bold labelLastDate">
                  {data}
                </label>
              </div>
            </div>
            <br />

            <hr />
            <hr />
            <hr />
            <hr />

            <h1 className="block text-indigo-700 text-center  font-bold  ">
              Rango de fechas
            </h1>
            <div className="container">
              <label
                className="block text-indigo-700   font-bold  inputDate"
                htmlFor="fecha"
              >
                Selecciona una fecha:
              </label>
              <input
                className="inputDate"
                type={enableDaySelection ? "date" : "month"}
                id="fecha"
                value={fechaInicio}
                onChange={handleFechaInicioChange}
              />
              {enableDaySelection && <p>¡Puedes seleccionar el día ahora!</p>}
            </div>

            <div className="container">
              <label
                className="block text-indigo-700   font-bold  inputDate"
                htmlFor="fecha"
              >
                Selecciona un dia:
              </label>
              <input
                className="inputDate"
                type="number"
                min={1}
                max={31}
                style={{
                  opacity: habilitado ? 1 : 0.5,
                  pointerEvents: habilitado ? "auto" : "none",
                }}
                value={numeroValor}
                onChange={(e) => setNumeroValor(e.target.value)}
              />
            </div>

            <div className="container">
              <button
                className="  bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={unificarValores}
              >
                Fecha a consultar:{" "}
              </button>
              <p className="block text-indigo-700   font-bold  inputDate">
                {" "}
                {fechaConcatenada}
              </p>
            </div>
          </div>

          {/*Filtros dropdown */}
          <div className="filtrosDropdown h-80 bg-indigo-100">
            <h1 className="block text-indigo-700 text-center  font-bold  ">
              Filtros
            </h1>

            <br />

            <label
              htmlFor="myDropdown"
              className="block text-indigo-700 text-center  font-bold  "
            >
              Selecciona una opción:
            </label>
            <select
              id="myDropdown"
              value={selectedOption}
              onChange={handleDropdownChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">Elija el Tipo de reporte</option>
              <option value="ReporteGeneral">Reporte General</option>
            </select>

            <br />

            <select
              id="countries"
              value={tipoCola}
              onChange={handleTipoColaChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="">Elija la cola a consultar</option>
              <option value="colaGEN">Cola General</option>
              <option value="Cola_Cobranzas_UIO">Cola UIO</option>
              <option value="Cola_Cobranzas_GYE">Cola GYE</option>
            </select>

            <div>
              <br />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                //onClick={fetchDataFromApi}
                onClick={handleButtonClick}
                disabled={botonHabilitado}
              >
                Generar Data
              </button>
              <div>
                {loading ? (
                  <BarLoader color="#36D7B7" loading={loading} />
                ) : (
                  <div>{apiData && <div></div>}</div>
                )}
              </div>
            </div>
          </div>

          {/*Filtros archivo button */}
          <div className="h-40 bg-indigo-100" id="uploadFile">
            <h1 className="block text-indigo-700 text-center  font-bold  ">
              Cargar archivo de reporte Expand
            </h1>

            <div
              className={
                selectedOption === "ReporteGeneral" ? "enabled" : "disabled"
              }
            >
              <br />
              <input
                className="  bg-blue-200 hover:bg-blue-300 text-indigo-700 font-bold py-2 px-4 rounded"
                type="file"
                onChange={handleFileChange}
              />
              <button
                className="  bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleApiCall}
              >
                Procesar el archivo
              </button>

              {apiError && <p>Error: {apiError}</p>}

              {apiResponse}
            </div>
          </div>

          {/*Filtros cargar archivos */}
          <div className="h-70 bg-indigo-100">
            <h1 className="block text-indigo-700 text-center  font-bold">
              Generar reporte Expand
            </h1>
            <br />
            <div>
              <button className="  bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                <ExcelReport data={datos} />
              </button>
            </div>
          </div>

          <div></div>
        </div>
      </div>
    </>
  );
}

export default App;
