

export const getChatbotResponse = (message) => {
  const msg = message.toLowerCase();
  let response = "";


  if (msg.includes("hola")) {
    response = "¡hola desde backend!  ¿En qué puedo ayudarte ?";
  } else if (msg.includes("evento")) {
    response = "sección del sitio.";
  } else if (msg.includes("atiendeme")) {
    response = "Claro, escríbeme tu pregunta ";
  } else {
    response = "No entendí muy bien, ¿puedes repetirlo o reformular tu mensaje?";
  }
  return response;
};


