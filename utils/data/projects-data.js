import ayla from '/public/image/ayla.jpg';
import crefin from '/public/image/crefin.jpg';
import realEstate from '/public/image/real-estate.jpg';
import travel from '/public/image/travel.jpg';

export const projectsData = [
    {
        id: 1,
        name: 'Infinitalk Software',
        description: 
        "Architecting microservices-based solutions for scalability and reliability."+
        "Developing backend functionalities using Node.js, Express, and MongoDB."+
        "Crafting responsive and intuitive user interfaces using React."+
        "Deploying and managing the application on Google Cloud Platform (GCP) and Firebase."+
        "Implementing robust data management solutions with MongoDB and PostgreSQL."+
        "Leading testing efforts and ensuring code quality through collaboration."+
        "Documenting architecture, design decisions, and codebase for future reference.",
        tools: ['Nodejs', 'React', 'Microservice', 'GCP', 'Firebase', 'BigQuery', 'Mongodb', 'PostgreSQL', 'Express', 'MongoDB', 'OpenAI API', 'Node Mailer'],
        role: 'Fullstack Developer',
        code: '',
        demo: '',
        image: crefin,
    },
    {
        id: 2,
        name: 'Bigget Data Software',
        description: 'As a Full Stack Developer on a comprehensive Business Management System project, my responsibilities encompassed' +
        'both API development and UI implementation. I utilized ASP.NET for building robust REST APIs and server-side rendering of views, while Angular was employed for frontend development. I contributed to system architecture design, developed modules covering API and UI functionalities, and seamlessly integrated third-party services and libraries into the system to enhance functionality and user experience. Additionally, I optimized database schema using Microsoft SQL Server, conducted unit tests, collaborated on quality assurance efforts, and documented architecture and codebase for knowledge sharing. Notably, I specialized in handling dynamic stored procedures to efficiently' +
        'manage complex business logic, ensuring the system\'s reliability and performance across various modules. '+
        'This involved close collaboration with the team to achieve project objectives effectively.',
        tools: ['ASP.NET', 'Angular', 'MicrosoftSQL', 'Microsoft Azure','PrimeNg'],
        role: 'Full Stack Developer',
        code: '',
        demo: '',
        image: travel,
    },
    {
        id: 3,
        name: 'ERS Software',
        description: 'As a Junior Frontend Developer on the Easy Restaurant Software (ERS) project, I contributed to the development of a comprehensive solution tailored for restaurant management. The ERS software aimed to streamline various operations within restaurants, providing functionalities for order management, table reservations, inventory tracking, and more. Utilizing Angular as the primary frontend framework, I played a key role in implementing user interfaces and ensuring a seamless user experience.',
        tools: ['Angular', 'ASP.NET', 'KendoUI'],
        code: '',
        role: 'Junior Frontend Developer',
        demo: '',
        image: realEstate,
    },
];


// Do not remove any property.
// Leave it blank instead as shown below

// {
//     id: 1,
//     name: '',
//     description: "",
//     tools: [],
//     role: '',
//     code: '',
//     demo: '',
//     image: crefin,
// },