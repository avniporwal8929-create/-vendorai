"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Types
export interface Product {
  name: string;
  price: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  availableStock: number;
  reorderLevel: number;
  vendor: string;
  station: string;
}

export interface Vendor {
  id: string;
  name: string;
  station: string;
  ordersCompleted: number;
  revenueGenerated: number;
  averageFulfillmentTime: number; // in minutes
  rating: number;
  status: "Active" | "Inactive";
}

export interface DeliveryAgent {
  id: string;
  name: string;
  status: "Available" | "On Delivery" | "Break";
  completedDeliveries: number;
  completionRate: number; // percentage
  averageDeliveryTime: number; // in minutes
}

export interface OrderProduct {
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  pnr: string;
  trainNumber: string;
  trainName: string;
  coach: string;
  seat: string;
  station: string;
  products: OrderProduct[];
  status: "Pending" | "Confirmed" | "Packing" | "Out For Delivery" | "Delivered" | "Cancelled";
  assignedVendor: string;
  assignedDeliveryAgent: string;
  createdAt: string;
  estimatedDeliveryTime: string;
  deliveryRoute?: string;
  packingDetails?: {
    recommendation: string;
    sequence: string[];
    estimatedTime: string;
  };
}

export interface SyncLog {
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export interface NotionConfig {
  integrationToken: string;
  ordersDbId: string;
  inventoryDbId: string;
  vendorsDbId: string;
  stationsDbId: string;
  agentsDbId: string;
  isConfigured: boolean;
}

interface NexusContextType {
  orders: Order[];
  inventory: InventoryItem[];
  vendors: Vendor[];
  agents: DeliveryAgent[];
  syncLogs: SyncLog[];
  notionConfig: NotionConfig;
  activeStationFilter: string;
  setActiveStationFilter: (station: string) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  assignAgentToOrder: (orderId: string, agentName: string) => void;
  assignVendorToOrder: (orderId: string, vendorName: string) => void;
  restockProduct: (itemId: string, amount: number) => void;
  triggerNotionSync: () => Promise<void>;
  saveNotionConfig: (config: Partial<NotionConfig>) => void;
  addOrder: (order: Omit<Order, "id" | "createdAt" | "packingDetails" | "estimatedDeliveryTime" | "deliveryRoute">) => void;
  getAiCopilotResponse: (query: string) => Promise<string>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

// Initial Mock Data
const INITIAL_PRODUCTS: Record<string, number> = {
  "Water Bottle": 20,
  "Charger": 350,
  "Tissue": 10,
  "ORS": 30,
  "Sanitizer": 50,
  "Baby Care Kit": 450,
};

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "inv-1", name: "Water Bottle", availableStock: 120, reorderLevel: 50, vendor: "Shree Balaji Foods", station: "New Delhi Railway Station" },
  { id: "inv-2", name: "Charger", availableStock: 12, reorderLevel: 15, vendor: "Raju Catering", station: "New Delhi Railway Station" },
  { id: "inv-3", name: "Tissue", availableStock: 200, reorderLevel: 60, vendor: "Shree Balaji Foods", station: "New Delhi Railway Station" },
  { id: "inv-4", name: "ORS", availableStock: 8, reorderLevel: 20, vendor: "Raju Catering", station: "New Delhi Railway Station" },
  { id: "inv-5", name: "Sanitizer", availableStock: 45, reorderLevel: 25, vendor: "Shree Balaji Foods", station: "New Delhi Railway Station" },
  { id: "inv-6", name: "Baby Care Kit", availableStock: 4, reorderLevel: 8, vendor: "Raju Catering", station: "New Delhi Railway Station" },
  
  { id: "inv-7", name: "Water Bottle", availableStock: 85, reorderLevel: 50, vendor: "RailBites", station: "Anand Vihar Railway Station" },
  { id: "inv-8", name: "Charger", availableStock: 25, reorderLevel: 15, vendor: "Express Meals", station: "Anand Vihar Railway Station" },
  { id: "inv-9", name: "Tissue", availableStock: 40, reorderLevel: 60, vendor: "RailBites", station: "Anand Vihar Railway Station" },
  { id: "inv-10", name: "ORS", availableStock: 30, reorderLevel: 20, vendor: "Express Meals", station: "Anand Vihar Railway Station" },
  { id: "inv-11", name: "Sanitizer", availableStock: 15, reorderLevel: 25, vendor: "RailBites", station: "Anand Vihar Railway Station" },
  { id: "inv-12", name: "Baby Care Kit", availableStock: 9, reorderLevel: 8, vendor: "Express Meals", station: "Anand Vihar Railway Station" },
];

const INITIAL_VENDORS: Vendor[] = [
  { id: "v-1", name: "Shree Balaji Foods", station: "New Delhi Railway Station", ordersCompleted: 1420, revenueGenerated: 38400, averageFulfillmentTime: 4.8, rating: 4.8, status: "Active" },
  { id: "v-2", name: "Raju Catering", station: "New Delhi Railway Station", ordersCompleted: 980, revenueGenerated: 24500, averageFulfillmentTime: 6.2, rating: 4.5, status: "Active" },
  { id: "v-3", name: "RailBites", station: "Anand Vihar Railway Station", ordersCompleted: 850, revenueGenerated: 19800, averageFulfillmentTime: 5.1, rating: 4.6, status: "Active" },
  { id: "v-4", name: "Express Meals", station: "Anand Vihar Railway Station", ordersCompleted: 1100, revenueGenerated: 27200, averageFulfillmentTime: 4.5, rating: 4.7, status: "Active" },
];

const INITIAL_AGENTS: DeliveryAgent[] = [
  { id: "a-1", name: "Rajesh Kumar", status: "Available", completedDeliveries: 412, completionRate: 98.4, averageDeliveryTime: 8.5 },
  { id: "a-2", name: "Amit Singh", status: "On Delivery", completedDeliveries: 389, completionRate: 96.2, averageDeliveryTime: 9.8 },
  { id: "a-3", name: "Suresh Sharma", status: "Available", completedDeliveries: 290, completionRate: 94.5, averageDeliveryTime: 11.2 },
  { id: "a-4", name: "Vikram Patel", status: "Break", completedDeliveries: 504, completionRate: 99.1, averageDeliveryTime: 7.2 },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-1",
    pnr: "4235897104",
    trainNumber: "12002",
    trainName: "NDLS Shatabdi Exp",
    coach: "C3",
    seat: "42",
    station: "New Delhi Railway Station",
    products: [
      { name: "Water Bottle", quantity: 2 },
      { name: "Tissue", quantity: 1 }
    ],
    status: "Pending",
    assignedVendor: "Shree Balaji Foods",
    assignedDeliveryAgent: "Unassigned",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    estimatedDeliveryTime: "12:15 PM"
  },
  {
    id: "ord-2",
    pnr: "8546912304",
    trainNumber: "12423",
    trainName: "NDLS Rajdhani Exp",
    coach: "A1",
    seat: "12",
    station: "New Delhi Railway Station",
    products: [
      { name: "Charger", quantity: 1 },
      { name: "Sanitizer", quantity: 1 }
    ],
    status: "Confirmed",
    assignedVendor: "Raju Catering",
    assignedDeliveryAgent: "Rajesh Kumar",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    estimatedDeliveryTime: "12:25 PM"
  },
  {
    id: "ord-3",
    pnr: "9048123764",
    trainNumber: "12259",
    trainName: "NDLS Duronto Express",
    coach: "H1",
    seat: "4",
    station: "Anand Vihar Railway Station",
    products: [
      { name: "ORS", quantity: 2 },
      { name: "Water Bottle", quantity: 1 }
    ],
    status: "Packing",
    assignedVendor: "RailBites",
    assignedDeliveryAgent: "Amit Singh",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    estimatedDeliveryTime: "12:35 PM"
  },
  {
    id: "ord-4",
    pnr: "3128475960",
    trainNumber: "14006",
    trainName: "Lichchhavi Exp",
    coach: "S2",
    seat: "15",
    station: "Anand Vihar Railway Station",
    products: [
      { name: "Baby Care Kit", quantity: 1 },
      { name: "Tissue", quantity: 2 }
    ],
    status: "Out For Delivery",
    assignedVendor: "Express Meals",
    assignedDeliveryAgent: "Suresh Sharma",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    estimatedDeliveryTime: "12:40 PM"
  },
  {
    id: "ord-5",
    pnr: "1102983746",
    trainNumber: "12050",
    trainName: "Gatimaan Exp",
    coach: "C1",
    seat: "8",
    station: "New Delhi Railway Station",
    products: [
      { name: "Sanitizer", quantity: 2 }
    ],
    status: "Delivered",
    assignedVendor: "Shree Balaji Foods",
    assignedDeliveryAgent: "Rajesh Kumar",
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    estimatedDeliveryTime: "10:55 AM"
  }
];

const NexusContext = createContext<NexusContextType | undefined>(undefined);

export const NexusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [activeStationFilter, setActiveStationFilter] = useState<string>("All");
  const [notionConfig, setNotionConfig] = useState<NotionConfig>({
    integrationToken: "",
    ordersDbId: "",
    inventoryDbId: "",
    vendorsDbId: "",
    stationsDbId: "",
    agentsDbId: "",
    isConfigured: false,
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    const savedOrders = localStorage.getItem("rq_orders");
    const savedInventory = localStorage.getItem("rq_inventory");
    const savedVendors = localStorage.getItem("rq_vendors");
    const savedAgents = localStorage.getItem("rq_agents");
    const savedLogs = localStorage.getItem("rq_sync_logs");
    const savedConfig = localStorage.getItem("rq_notion_config");

    if (savedOrders) setOrders(JSON.parse(savedOrders));
    else setOrders(INITIAL_ORDERS);

    if (savedInventory) setInventory(JSON.parse(savedInventory));
    else setInventory(INITIAL_INVENTORY);

    if (savedVendors) setVendors(JSON.parse(savedVendors));
    else setVendors(INITIAL_VENDORS);

    if (savedAgents) setAgents(JSON.parse(savedAgents));
    else setAgents(INITIAL_AGENTS);

    if (savedLogs) setSyncLogs(JSON.parse(savedLogs));
    else {
      const defaultLogs: SyncLog[] = [
        { timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), message: "RailQuick Nexus OS loaded successfully.", type: "info" },
        { timestamp: new Date(Date.now() - 2.5 * 3600000).toISOString(), message: "Local fallback database active.", type: "info" },
        { timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), message: "Initial sync with Notion simulated workspace templates.", type: "success" }
      ];
      setSyncLogs(defaultLogs);
    }

    if (savedConfig) setNotionConfig(JSON.parse(savedConfig));
  }, []);

  // Save changes helper
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Add system sync log helper
  const addLog = (message: string, type: SyncLog["type"] = "info") => {
    setSyncLogs((prev) => {
      const newLogs = [{ timestamp: new Date().toISOString(), message, type }, ...prev].slice(0, 100);
      saveState("rq_sync_logs", newLogs);
      return newLogs;
    });
  };

  // AI Packing Assist recommendation builder
  const getPackingDetails = (products: OrderProduct[]) => {
    const mainProducts = products.map(p => `${p.name} (x${p.quantity})`).join(" + ");
    
    // Simple heuristics
    let packageSize = "Small Package";
    let sequence = ["Gather items at packing station"];
    let estimatedTime = "30 seconds";

    const hasCharger = products.some(p => p.name === "Charger");
    const hasKit = products.some(p => p.name === "Baby Care Kit");
    const totalQty = products.reduce((acc, p) => acc + p.quantity, 0);

    if (hasKit) {
      packageSize = "Large Thermal Box";
      sequence = [
        "Select insulated main pouch",
        "Place Baby Care Kit container at the base",
        "Lay down sanitizers on right compartment side",
        "Insert soft tissue packs on top to cushion movements",
        "Affix tamper-evident barcoded seal"
      ];
      estimatedTime = "75 seconds";
    } else if (totalQty > 2 || hasCharger) {
      packageSize = "Medium Secure Envelope";
      sequence = [
        "Verify product bar codes",
        "Place heavy water bottle/chargers at the bottom base",
        "Arrange snacks/ORS on middle shelf position",
        "Add sanitizer and tissue wipes on top",
        "Seal using adhesive strip"
      ];
      estimatedTime = "50 seconds";
    } else {
      sequence = [
        "Pick paper carry sleeve",
        "Insert water bottle vertically",
        "Slide tissue/ORS alongside",
        "Fold top flap twice"
      ];
    }

    return {
      recommendation: `Use ${packageSize} for order: ${mainProducts}.`,
      sequence,
      estimatedTime
    };
  };

  // Order state update
  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId) {
          const prevStatus = ord.status;
          const packingDetails = status === "Confirmed" || status === "Packing" 
            ? getPackingDetails(ord.products) 
            : ord.packingDetails;

          let route = ord.deliveryRoute;
          if (status === "Packing") {
            const platform = Math.floor(Math.random() * 8) + 1;
            route = `Exit main kitchen -> Escalator up to Platform ${platform} -> Move towards Coach Position ${ord.coach}`;
          }

          addLog(`Order PNR ${ord.pnr} status changed: ${prevStatus} -> ${status}`, "info");

          // Adjust inventory if transitioned to packing/confirmed
          if (prevStatus === "Pending" && (status === "Confirmed" || status === "Packing")) {
            // Deduct stock
            deductInventory(ord.products, ord.station);
          }

          return { 
            ...ord, 
            status, 
            packingDetails, 
            deliveryRoute: route,
            estimatedDeliveryTime: status === "Out For Delivery" ? "In 8 Mins" : ord.estimatedDeliveryTime
          };
        }
        return ord;
      });
      saveState("rq_orders", updated);
      return updated;
    });
  };

  const deductInventory = (products: OrderProduct[], station: string) => {
    setInventory((prev) => {
      const updated = prev.map((inv) => {
        const orderProd = products.find(p => p.name === inv.name && inv.station === station);
        if (orderProd) {
          const newStock = Math.max(0, inv.availableStock - orderProd.quantity);
          if (newStock <= inv.reorderLevel) {
            addLog(`CRITICAL STOCK WARNING: ${inv.name} at ${inv.station} is low (${newStock}/${inv.reorderLevel})`, "warning");
          }
          return { ...inv, availableStock: newStock };
        }
        return inv;
      });
      saveState("rq_inventory", updated);
      return updated;
    });
  };

  const assignAgentToOrder = (orderId: string, agentName: string) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId) {
          addLog(`Assigned agent ${agentName} to Order PNR ${ord.pnr}`, "success");
          return { ...ord, assignedDeliveryAgent: agentName };
        }
        return ord;
      });
      saveState("rq_orders", updated);
      return updated;
    });
  };

  const assignVendorToOrder = (orderId: string, vendorName: string) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId) {
          addLog(`Assigned vendor ${vendorName} to Order PNR ${ord.pnr}`, "info");
          return { ...ord, assignedVendor: vendorName };
        }
        return ord;
      });
      saveState("rq_orders", updated);
      return updated;
    });
  };

  const restockProduct = (itemId: string, amount: number) => {
    setInventory((prev) => {
      const updated = prev.map((inv) => {
        if (inv.id === itemId) {
          const newStock = inv.availableStock + amount;
          addLog(`Restocked ${inv.name} at ${inv.station}: +${amount} (New Total: ${newStock})`, "success");
          return { ...inv, availableStock: newStock };
        }
        return inv;
      });
      saveState("rq_inventory", updated);
      return updated;
    });
  };

  const addOrder = (orderData: Omit<Order, "id" | "createdAt" | "packingDetails" | "estimatedDeliveryTime" | "deliveryRoute">) => {
    const id = `ord-${Date.now()}`;
    const newOrder: Order = {
      ...orderData,
      id,
      createdAt: new Date().toISOString(),
      estimatedDeliveryTime: "In 15 Mins",
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      saveState("rq_orders", updated);
      return updated;
    });
    addLog(`New Order received! PNR ${newOrder.pnr} on Train ${newOrder.trainNumber} at ${newOrder.station}`, "success");
  };

  // Simulated Notion DB Synchronization
  const triggerNotionSync = async (): Promise<void> => {
    addLog("Notion synchronization started...", "info");
    
    // Simulate API timings
    return new Promise((resolve) => {
      setTimeout(() => {
        addLog("Notion API Connection: Handshake Successful.", "info");
      }, 500);

      setTimeout(() => {
        addLog(`Pushing ${orders.length} order entries to database [Orders DB ID: ${notionConfig.ordersDbId || "MOCK_DB_1"}].`, "info");
      }, 1000);

      setTimeout(() => {
        addLog(`Pushing inventory states to [Inventory DB ID: ${notionConfig.inventoryDbId || "MOCK_DB_2"}].`, "info");
      }, 1500);

      setTimeout(() => {
        addLog(`Pulling updated Delivery Agent rosters.`, "info");
      }, 2000);

      setTimeout(() => {
        addLog("Notion databases synced successfully! 0 conflicts found.", "success");
        resolve();
      }, 2500);
    });
  };

  const saveNotionConfig = (config: Partial<NotionConfig>) => {
    setNotionConfig((prev) => {
      const updated = { ...prev, ...config, isConfigured: true };
      saveState("rq_notion_config", updated);
      addLog("Notion settings saved. Re-established webhook endpoints.", "success");
      return updated;
    });
  };

  // AI Copilot Query Processing
  const getAiCopilotResponse = async (query: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const norm = query.toLowerCase();
        
        // Query 1: Restock recommendation
        if (norm.includes("restock") || norm.includes("running low") || norm.includes("low stock")) {
          const lowStock = inventory.filter(item => item.availableStock <= item.reorderLevel);
          if (lowStock.length === 0) {
            resolve("### AI Operational Audit:\n\nAll inventory levels are **optimal**! No restocks are required today. Good job!");
            return;
          }
          let md = "### AI Restock Action Plan for Tomorrow:\n\nI detected **" + lowStock.length + "** products at or below critical reorder limits:\n\n";
          lowStock.forEach(item => {
            const shortage = item.reorderLevel * 2 - item.availableStock;
            md += `- **${item.name}** at *${item.station}*\n  - Available: \`${item.availableStock}\` (Alert Level: \`${item.reorderLevel}\`)\n  - Reorder suggestion: **+${shortage} units** (Vendor: *${item.vendor}*)\n\n`;
          });
          md += "\nWould you like me to push this purchase order draft straight to your **Notion Inventory Database**?";
          resolve(md);
          return;
        }

        // Query 2: Demand location
        if (norm.includes("highest demand") || norm.includes("station") && norm.includes("demand")) {
          const stationRevenue: Record<string, number> = {};
          const stationOrders: Record<string, number> = {};
          orders.forEach(o => {
            const rev = o.products.reduce((acc, p) => acc + (INITIAL_PRODUCTS[p.name] || 0) * p.quantity, 0);
            stationRevenue[o.station] = (stationRevenue[o.station] || 0) + rev;
            stationOrders[o.station] = (stationOrders[o.station] || 0) + 1;
          });

          const stations = Object.keys(stationRevenue);
          if (stations.length === 0) {
            resolve("No order volume data registered yet. Demand forecasting requires active transaction logs.");
            return;
          }
          
          let topStation = stations[0];
          stations.forEach(s => {
            if (stationRevenue[s] > stationRevenue[topStation]) {
              topStation = s;
            }
          });

          resolve(`### Station Traffic Analytics:\n\n**${topStation}** is showing the highest demand today.\n\n- **Total Revenue generated**: ₹${stationRevenue[topStation]}\n- **Order Count**: ${stationOrders[topStation]} bookings\n- **Platform Hotspots**: Platform 2 and 5 (based on train arrivals)\n\nAnand Vihar is trailing by approx ${Math.abs((stationRevenue[stations[0]] || 0) - (stationRevenue[stations[1]] || 0))} INR. We suggest shifting 1 delivery runner from Anand Vihar to New Delhi to cover the peak.`);
          return;
        }

        // Query 3: Best vendor
        if (norm.includes("vendor") && (norm.includes("performing") || norm.includes("best") || norm.includes("performance"))) {
          const sortedVendors = [...vendors].sort((a, b) => b.rating - a.rating || b.ordersCompleted - a.ordersCompleted);
          const top = sortedVendors[0];
          
          resolve(`### Vendor Performance Review:\n\n**${top.name}** at *${top.station}* is today's best performing vendor:\n\n- **Performance Rating**: ⭐ \`${top.rating}/5.0\`\n- **Avg Fulfillment Speed**: \`${top.averageFulfillmentTime} mins\` (target is < 6 mins)\n- **Completed Deliveries**: \`${top.ordersCompleted} orders\`\n- **Revenue Contribution**: \`₹${top.revenueGenerated}\`\n\n*Operational Note*: Vendor *Raju Catering* has seen fulfillment latency spike to **6.2 mins** in the last hour due to kitchen backlog. Recommend dispatching packaging queue updates.`);
          return;
        }

        // Query 4: Forecast tomorrow's demand
        if (norm.includes("predict") || norm.includes("forecast") || norm.includes("tomorrow")) {
          resolve(`### AI Predictive Forecasting Models (Next 24H):\n\nBased on scheduled passenger train bookings (PNR status scans) and history:\n\n1. **New Delhi Railway Station (NDLS)**:\n   - Expected volume: **142 orders** (+15% spike due to Shatabdi vacation traffic)\n   - Hot category: **Water Bottle & ORS** (High humidity index predicted)\n\n2. **Anand Vihar Railway Station (ANVT)**:\n   - Expected volume: **95 orders**\n   - Hot category: **Baby Care Kit**\n\n**Actionable Advice**: Order an additional **150 units of Water Bottles** for NDLS platforms tonight. Pre-stage 10 medium sized boxes.`);
          return;
        }

        // Default response
        resolve(`### RailQuick Operations Co-Pilot:\n\nHello! I am connected directly to your station operations data. Here is what I can analyze right now:\n\n- **Inventory status**: Identify low stock items and draft purchase orders.\n- **Vendor speed logs**: Compare vendor SLA compliance times across stations.\n- **Delivery operations**: Recommend agent assignments and route maps.\n- **Demand trends**: Generate volume predictions for tomorrow.\n\n*How can I help you optimize station commerce today?*`);
      }, 1000);
    });
  };

  return (
    <NexusContext.Provider
      value={{
        orders,
        inventory,
        vendors,
        agents,
        syncLogs,
        notionConfig,
        activeStationFilter,
        setActiveStationFilter,
        updateOrderStatus,
        assignAgentToOrder,
        assignVendorToOrder,
        restockProduct,
        triggerNotionSync,
        saveNotionConfig,
        addOrder,
        getAiCopilotResponse,
        mobileMenuOpen,
        setMobileMenuOpen,
      }}
    >
      {children}
    </NexusContext.Provider>
  );
};

export const useNexus = () => {
  const context = useContext(NexusContext);
  if (context === undefined) {
    throw new Error("useNexus must be used within a NexusProvider");
  }
  return context;
};
