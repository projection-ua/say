import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { AnimatePresence, motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import s from "./MapPopup.module.css";
import { NpLocation } from "../../types/npTypes";
import MarkerClusterGroup from 'react-leaflet-cluster';







interface NovaPoshtaMapPopupProps {
  cities: NpLocation[];
  selectedCity: string;
  deliveryType: 'warehouse' | 'postomat';
  onClose: () => void;
  onSelect: (warehouseName: string) => void;
  onTabChange: (deliveryType: 'warehouse' | 'postomat') => void; // 👈 Додаємо
}



export const NovaPoshtaMapPopup: React.FC<NovaPoshtaMapPopupProps> = ({
                                                                        cities,
                                                                        selectedCity,
                                                                        deliveryType, // 👈 додати сюди!
                                                                        onClose,
                                                                        onSelect,
                                                                        onTabChange,
                                                                      }) => {

  const [search, setSearch] = useState("");

  const warehouses = useMemo(() => {
    return cities.find((city) => city.name === selectedCity)?.warehouses || [];
  }, [cities, selectedCity]);


  const filteredWarehouses = useMemo(() => {
    const filteredByTab = warehouses.filter((w) =>
        deliveryType === "warehouse"
            ? !w.name.toLowerCase().includes("поштомат")
            : w.name.toLowerCase().includes("поштомат")
    );

    return search
        ? filteredByTab.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()))
        : filteredByTab;
  }, [warehouses, deliveryType, search]);



  const userPosition: [number, number] = warehouses.length
      ? [
        parseFloat(warehouses[0].position.latitude),
        parseFloat(warehouses[0].position.longitude),
      ]
      : [50.4501, 30.5234]; // fallback: Київ

  const customIcon = new L.Icon({
    iconUrl: "/icons/nova-icon.png",
    iconSize: [50, 62],
  });

  return createPortal(
      <AnimatePresence>
        <div className={s.overlay}>
          <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={s.popup}
          >
            <button onClick={onClose} className={s.closeBtn}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.22001 19.1924L9.99819 11.4142L17.7764 19.1924L19.1906 17.7782L11.4124 10L19.1906 2.22182L17.7764 0.807611L9.99819 8.58579L2.22001 0.807613L0.805798 2.22183L8.58397 10L0.805798 17.7782L2.22001 19.1924Z" fill="#1A1A1A"/>
              </svg>
            </button>
            <div className={s.sidebar}>
              <div className={s.topBar}>
                <h2>Оберіть адресу доставки</h2>
              </div>

              <div className={s.tabs}>
                <div
                    className={`${s.tabItem} ${deliveryType === "warehouse" ? s.active : ""}`}
                    onClick={() => onTabChange("warehouse")} // 👈 міняємо тип доставки
                >
                  На відділення
                </div>
                <div
                    className={`${s.tabItem} ${deliveryType === "postomat" ? s.active : ""}`}
                    onClick={() => onTabChange("postomat")} // 👈 міняємо тип доставки
                >
                  Поштомат
                </div>
              </div>

              <div className={s.mapInputContainer}>
                <input
                    className={s.searchInput}
                    placeholder="Введіть назву вулиці"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className={s.list}>

                {filteredWarehouses.map((w, i) => (
                    <div
                        key={i}
                        className={s.listItem}
                        onClick={() => {
                          onSelect(w.name);
                          onClose();
                        }}
                    >
                      <p>{w.name}</p>
                    </div>
                ))}
              </div>
            </div>

            <div className={s.mapWrapper}>
              <MapContainer
                  center={userPosition}
                  zoom={14}
                  style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <MarkerClusterGroup
                    chunkedLoading
                    showCoverageOnHover={false}
                    maxClusterRadius={50} // можна налаштувати
                >
                  {filteredWarehouses.map((w, i) => (
                      <Marker
                          key={i}
                          position={[
                            parseFloat(w.position.latitude),
                            parseFloat(w.position.longitude),
                          ]}
                          icon={customIcon}
                          eventHandlers={{
                            click: () => {
                              onSelect(w.name);
                              onClose();
                            },
                          }}
                      >
                        <Popup>{w.name}</Popup>
                      </Marker>
                  ))}
                </MarkerClusterGroup>

              </MapContainer>
            </div>


          </motion.div>
        </div>
      </AnimatePresence>,
      document.body
  );
};

export default NovaPoshtaMapPopup;
