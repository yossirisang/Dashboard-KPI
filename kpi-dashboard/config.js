const CONFIG = {
    USERS_SHEET_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT46EP2xu4aZCQsT6V8tNNolBJ1PpNvu2SAIpypQ0ZXRxODokx-5h2KX9Sp-bXgw1HvwbuE3YRqIC1r/pub?gid=0&single=true&output=csv",
    
    MONTHLY_METRICS: {
        "2026-10": {
            sales: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6xc3DQwV-xvuG_0d9OATKRjVoxP2pVzX5Si95vXBJXyrmo4WFVlc2K84aNfcIWQ/pub?gid=1693059487&single=true&output=csv",
            interaksi: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6xc3DQwV-xvuG_0d9OATKRjVoxP2pVzX5Si95vXBJXyrmo4WFVlc2K84aNfcIWQ/pub?gid=2115127099&single=true&output=csv",
            ticket: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6xc3DQwV-xvuG_0d9OATKRjVoxP2pVzX5Si95vXBJXyrmo4WFVlc2K84aNfcIWQ/pub?gid=1604890666&single=true&output=csv",
            fcr: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6xc3DQwV-xvuG_0d9OATKRjVoxP2pVzX5Si95vXBJXyrmo4WFVlc2K84aNfcIWQ/pub?gid=1634651645&single=true&output=csv",
            sales_report: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6xc3DQwV-xvuG_0d9OATKRjVoxP2pVzX5Si95vXBJXyrmo4WFVlc2K84aNfcIWQ/pub?gid=1657971183&single=true&output=csv",
            retensi_report: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6xc3DQwV-xvuG_0d9OATKRjVoxP2pVzX5Si95vXBJXyrmo4WFVlc2K84aNfcIWQ/pub?gid=587588832&single=true&output=csv",
            aht_report: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6xc3DQwV-xvuG_0d9OATKRjVoxP2pVzX5Si95vXBJXyrmo4WFVlc2K84aNfcIWQ/pub?gid=1883424615&single=true&output=csv"
        },
        "2026-09": {
            sales: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6GPe6lGQy98sH4f9RcCPo9MkbtlIUSiOmqIav_gwEIEB9slBoi1GlocMGQk_3IQ/pub?gid=407201662&single=true&output=csv",
            interaksi: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6GPe6lGQy98sH4f9RcCPo9MkbtlIUSiOmqIav_gwEIEB9slBoi1GlocMGQk_3IQ/pub?gid=626587370&single=true&output=csv",
            ticket: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6GPe6lGQy98sH4f9RcCPo9MkbtlIUSiOmqIav_gwEIEB9slBoi1GlocMGQk_3IQ/pub?gid=1183530911&single=true&output=csv",
            fcr: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6GPe6lGQy98sH4f9RcCPo9MkbtlIUSiOmqIav_gwEIEB9slBoi1GlocMGQk_3IQ/pub?gid=947655857&single=true&output=csv",
            sales_report: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6GPe6lGQy98sH4f9RcCPo9MkbtlIUSiOmqIav_gwEIEB9slBoi1GlocMGQk_3IQ/pub?gid=1613088010&single=true&output=csv",
            retensi_report: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6GPe6lGQy98sH4f9RcCPo9MkbtlIUSiOmqIav_gwEIEB9slBoi1GlocMGQk_3IQ/pub?gid=480068319&single=true&output=csv",
            aht_report: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6GPe6lGQy98sH4f9RcCPo9MkbtlIUSiOmqIav_gwEIEB9slBoi1GlocMGQk_3IQ/pub?gid=645084504&single=true&output=csv"
        }
    }
};

// Global Variables
let csvCache = {}; 
let allUserRows = []; 
let activeChartType = 'sales'; 
let currentChartData = {
    sales: { mobile: [], fixed: [], labels: [] },
    interaksi: { mobile: [], fixed: [], labels: [] },
    ticket: { mobile: [], fixed: [], labels: [] }
};
let mainChart = null; 
let ahtChart = null; 
let selectedAgentForModal = null;
let selectedReportMonth = "2026-10";
let activeModalTab = "summary"; 

let filteredAgentList = [];
let currentPage = 1;
const pageSize = 20;

let selectedTeamMonth = "2026-10";
