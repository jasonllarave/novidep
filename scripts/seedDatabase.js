import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { KnowledgeBase } from '../models/KnowledgeBase.js';
import { Product } from '../models/Product.js';
import { Event } from '../models/Event.js';

dotenv.config();

const knowledgeData = [
  {
    category: 'links',
    keywords: ['tienda', 'comprar', 'productos', 'shop','donaciones', 'apoyar', 'talleres'],
    question: '¿Dónde está la tienda?',
    answer: {
      text: 'Puedes visitar nuestra tienda en línea:',
      links: [
        { title: 'Tienda Principal', url: 'https://www.colombianoviolenta.org/tienda/' },
        { title: 'Donaciones', url: 'https://donorbox.org/colombianoviolenta?fbclid=IwAR316Isb0K0kBz6cu8ZbTk4j8j8FDBXIXA-_BEhvmI8OCPc6RzoWu4z5JE0' },
        { title: 'Cartilla', url: 'https://www.colombianoviolenta.org/cartilla/' }
      ]
    },
    priority: 10
  },
  {
    category: 'horarios',
    keywords: ['horario', 'abierto', 'cerrado', 'atienden'],
    question: '¿Cuál es el horario de atención?',
    answer: {
      text: ' **Nuestros horarios:**\n\n' +
            '• Lunes a Viernes: 8:00 AM - 6:00 PM\n' +
            '• Sábados: 9:00 AM - 2:00 PM\n' +
            '• Domingos: Cerrado\n\n' +
            ' Chat online disponible 24/7'
    },
    priority: 8
  },
  {
    category: 'contacto',
    keywords: ['contacto', 'teléfono', 'email', 'whatsapp'],
    question: '¿Cómo los contacto?',
    answer: {
      text: ' **Contáctanos:**\n\n' +
            '• Teléfono: (601) 123-4567\n' +
            '• WhatsApp: +57 315 790 27 61\n' +
            '• Email: info@colombianoviolenta.org\n' +
            '• Instagram: @colombianoviolenta\n' +
            '• Facebook: Colombia Noviolenta',
      links: [
        { title: 'WhatsApp', url: 'https://wa.me/573157902761' },
        { title: 'Email', url: 'mailto:info@colombianoviolenta.org' }
      ]
    },
    priority: 9
  },
  {
    category: 'servicios',
    keywords: ['servicio', 'ofrece', 'hace', 'ayuda'],
    question: '¿Qué servicios ofrecen?',
    answer: {
      text: ' **Nuestros Servicios:**\n\n' +
            '• Talleres de manejo de emociones\n' +
            '• Consultas psicológicas\n' +
            '• Grupos de apoyo\n' +
            '• Recursos educativos\n' +
            '• Eventos comunitarios\n' +
            '• Tienda de materiales',
      links: [
        { title: 'Ver todos los servicios', url: 'https://www.colombianoviolenta.org/servicios/' }
      ]
    },
    priority: 7
  },
  {
    category: 'recursos',
    keywords: ['recurso', 'material', 'descarga', 'gratis', 'documento'],
    question: 'Recursos gratuitos',
    answer: {
      text: ' **Recursos Gratuitos:**\n\n' +
            '• Guías descargables\n' +
            '• Videos educativos\n' +
            '• Podcasts\n' +
            '• Artículos del blog',
      links: [
        { title: 'Biblioteca Digital', url: 'https://colombianoviolenta.org/recursos' },
        { title: 'Blog', url: 'https://colombianoviolenta.org/blog' }
      ]
    },
    priority: 6
  }
];

const productsData = [
  {
    name: 'Libro: Paz Interior',
    description: 'Guía práctica para el manejo de emociones y construcción de paz personal',
    category: 'libros',
    price: { amount: 45000, currency: 'COP' },
    stock: 20,
    url: 'https://colombianoviolenta.org/tienda/libro-paz-interior',
    tags: ['libro', 'paz', 'emociones', 'autoayuda'],
    isActive: true
  },
  {
    name: 'Curso Online: Manejo de la Ira',
    description: 'Curso de 4 semanas para aprender técnicas efectivas de control de la ira',
    category: 'cursos',
    price: { amount: 150000, currency: 'COP' },
    stock: 100,
    url: 'https://colombianoviolenta.org/cursos/manejo-ira',
    tags: ['curso', 'ira', 'online', 'emociones'],
    isActive: true
  },
  {
    name: 'Taller Presencial: Comunicación Noviolenta',
    description: 'Taller de 8 horas sobre técnicas de comunicación efectiva y empática',
    category: 'talleres',
    price: { amount: 80000, currency: 'COP' },
    stock: 15,
    url: 'https://colombianoviolenta.org/talleres/comunicacion',
    tags: ['taller', 'comunicación', 'presencial'],
    isActive: true
  },
  {
    name: 'Kit de Meditación',
    description: 'Set completo: cojín, incienso, guía de meditación y audio descargable',
    category: 'merchandising',
    price: { amount: 95000, currency: 'COP' },
    stock: 10,
    url: 'https://colombianoviolenta.org/tienda/kit-meditacion',
    tags: ['meditación', 'mindfulness', 'kit'],
    isActive: true
  },
  {
    name: 'Consulta Psicológica Individual',
    description: 'Sesión de 50 minutos con psicólogo especializado',
    category: 'consultas',
    price: { amount: 120000, currency: 'COP' },
    stock: 50,
    url: 'https://colombianoviolenta.org/agendar-consulta',
    tags: ['consulta', 'psicología', 'terapia'],
    isActive: true
  }
];

const eventsData = [
  {
    title: 'Taller: Gestión del Estrés',
    description: 'Aprende técnicas prácticas para manejar el estrés diario',
    type: 'taller',
    date: new Date('2024-11-15T15:00:00'),
    location: 'presencial',
    address: 'Calle 100 #15-20, Bogotá',
    price: { amount: 50000, isFree: false },
    capacity: 30,
    registered: 12,
    registrationUrl: 'https://colombianoviolenta.org/eventos/gestion-estres',
    isActive: true
  },
  {
    title: 'Webinar Gratuito: Ansiedad en Tiempos Modernos',
    description: 'Conferencia online sobre cómo enfrentar la ansiedad',
    type: 'webinar',
    date: new Date('2024-11-20T18:00:00'),
    location: 'virtual',
    price: { amount: 0, isFree: true },
    capacity: 200,
    registered: 87,
    registrationUrl: 'https://colombianoviolenta.org/eventos/webinar-ansiedad',
    isActive: true
  },
  {
    title: 'Grupo de Apoyo: Superando la Ira',
    description: 'Espacio seguro para compartir experiencias y aprender juntos',
    type: 'grupo_apoyo',
    date: new Date('2024-11-25T17:00:00'),
    location: 'presencial',
    address: 'Calle 100 #15-20, Bogotá',
    price: { amount: 0, isFree: true },
    capacity: 15,
    registered: 8,
    registrationUrl: 'https://colombianoviolenta.org/grupos/ira',
    isActive: true
  },
  {
    title: 'Feria de Bienestar Emocional',
    description: 'Stands, actividades, charlas y recursos gratuitos',
    type: 'feria',
    date: new Date('2024-12-05T10:00:00'),
    location: 'presencial',
    address: 'Parque El Virrey, Bogotá',
    price: { amount: 0, isFree: true },
    capacity: 500,
    registered: 156,
    registrationUrl: 'https://colombianoviolenta.org/eventos/feria-bienestar',
    isActive: true
  },
  {
    title: 'Conferencia: Comunicación en Familia',
    description: 'Expertos hablan sobre cómo mejorar la comunicación familiar',
    type: 'conferencia',
    date: new Date('2024-12-10T16:00:00'),
    location: 'hibrido',
    address: 'Universidad Nacional + Online',
    price: { amount: 30000, isFree: false },
    capacity: 150,
    registered: 45,
    registrationUrl: 'https://colombianoviolenta.org/eventos/comunicacion-familia',
    isActive: true
  }
];

async function seedDatabase() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Conectado a MongoDB');
    
    // Limpiar colecciones existentes
    await KnowledgeBase.deleteMany({});
    await Product.deleteMany({});
    await Event.deleteMany({});
    console.log('  Colecciones limpiadas');
    
    // Insertar Knowledge Base
    await KnowledgeBase.insertMany(knowledgeData);
    console.log(` ${knowledgeData.length} entradas de Knowledge Base insertadas`);
    
    // Insertar Productos
    await Product.insertMany(productsData);
    console.log(` ${productsData.length} productos insertados`);
    
    // Insertar Eventos
    await Event.insertMany(eventsData);
    console.log(` ${eventsData.length} eventos insertados`);
    
    console.log('\n Base de datos poblada exitosamente!');
    
    // Mostrar resumen
    console.log('\n Resumen:');
    console.log(`   Knowledge Base: ${await KnowledgeBase.countDocuments()} registros`);
    console.log(`   Productos: ${await Product.countDocuments()} registros`);
    console.log(`   Eventos: ${await Event.countDocuments()} registros`);
    
    process.exit(0);
  } catch (error) {
    console.error(' Error poblando la base de datos:', error);
    process.exit(1);
  }
}

seedDatabase();