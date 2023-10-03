import { SidebarItem } from "./sidebar-item";

type Notebook = {
  id: string;
};

export const Sidebar = ({
  notebooks,
  selectedNotebook,
  onSelectNotebook,
  addNotebook,
}: {
  notebooks: Notebook[];
  selectedNotebook: string;
  onSelectNotebook: (id: string) => void;
  addNotebook: () => void;
}): JSX.Element => {
  return (
    <div className="rounded-md w-[286px] h-[702px] absolute left-[0.5px] top-[60px] overflow-hidden">
      <div className="absolute" style={{ inset: "0" }}>
        <div className="w-[264.92px] h-[341px] static">
          <div className="w-[264.92px] h-[341px] static">
            <div className="bg-fluree-no-fill rounded-lg border-solid border-ui-main-200 border flex flex-col gap-6 items-start justify-start w-[264.46px] absolute left-[10.8px] top-[calc(50%_-_298px)]">
              <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                <div className="bg-fluree-no-fill flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                  <div className="bg-ui-main-200 self-stretch shrink-0 h-px relative"></div>
                  {notebooks.map((notebook) => (
                    <SidebarItem
                      id={notebook.id}
                      key={notebook.id}
                      onSelectNotebook={onSelectNotebook}
                      background={
                        notebook.id === selectedNotebook ? "bg-[#e1f8ff]" : ""
                      }
                      text={notebook.id}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="w-[264.87px] h-[24px] static">
              <div className="w-[256.38px] h-[20.45px] static">
                <button onClick={addNotebook}>
                  <svg
                    className="absolute left-[253.81px] top-[13.46px] overflow-visible"
                    style={{}}
                    width="17"
                    height="17"
                    viewBox="0 0 17 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.30576 14.8569C10.0031 14.8569 11.631 14.1826 12.8312 12.9824C14.0315 11.7821 14.7058 10.1543 14.7058 8.45688C14.7058 6.7595 14.0315 5.13163 12.8312 3.9314C11.631 2.73117 10.0031 2.05688 8.30576 2.05688C6.60838 2.05688 4.98051 2.73117 3.78028 3.9314C2.58005 5.13163 1.90576 6.7595 1.90576 8.45688C1.90576 10.1543 2.58005 11.7821 3.78028 12.9824C4.98051 14.1826 6.60838 14.8569 8.30576 14.8569ZM9.10576 6.05688C9.10576 5.84471 9.02148 5.64123 8.87145 5.4912C8.72142 5.34117 8.51793 5.25688 8.30576 5.25688C8.09359 5.25688 7.89011 5.34117 7.74008 5.4912C7.59005 5.64123 7.50576 5.84471 7.50576 6.05688V7.65688H5.90576C5.69359 7.65688 5.49011 7.74117 5.34008 7.8912C5.19005 8.04123 5.10576 8.24471 5.10576 8.45688C5.10576 8.66906 5.19005 8.87254 5.34008 9.02257C5.49011 9.1726 5.69359 9.25688 5.90576 9.25688H7.50576V10.8569C7.50576 11.0691 7.59005 11.2725 7.74008 11.4226C7.89011 11.5726 8.09359 11.6569 8.30576 11.6569C8.51793 11.6569 8.72142 11.5726 8.87145 11.4226C9.02148 11.2725 9.10576 11.0691 9.10576 10.8569V9.25688H10.7058C10.9179 9.25688 11.1214 9.1726 11.2714 9.02257C11.4215 8.87254 11.5058 8.66906 11.5058 8.45688C11.5058 8.24471 11.4215 8.04123 11.2714 7.8912C11.1214 7.74117 10.9179 7.65688 10.7058 7.65688H9.10576V6.05688Z"
                      fill="#00A0D1"
                    />
                  </svg>
                </button>
                <div
                  className="text-ui-main-900 text-left absolute left-9 bottom-[672.45px]"
                  style={{
                    font: "var(--leading-none-text-base-font-semibold, 600 16px/16px 'Inter', sans-serif)",
                  }}
                >
                  Analyses{" "}
                </div>

                <svg
                  className="absolute left-[10.34px] top-[11px] overflow-visible"
                  style={{}}
                  width="22"
                  height="21"
                  viewBox="0 0 22 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.22789 2.00427C3.94487 2.00427 2.90479 3.01163 2.90479 4.25427V15.7543C2.90479 16.9969 3.94487 18.0043 5.22789 18.0043H17.1015C18.3846 18.0043 19.4246 16.9969 19.4246 15.7543V4.25427C19.4246 3.01163 18.3846 2.00427 17.1015 2.00427H5.22789ZM16.3028 5.75427C16.3028 5.34006 15.967 5.00427 15.5528 5.00427C15.1386 5.00427 14.8028 5.34006 14.8028 5.75427V14.2543C14.8028 14.6685 15.1386 15.0043 15.5528 15.0043C15.967 15.0043 16.3028 14.6685 16.3028 14.2543V5.75427ZM7.52663 11.7543C7.52663 11.3401 7.19084 11.0043 6.77663 11.0043C6.36241 11.0043 6.02663 11.3401 6.02663 11.7543V14.2543C6.02663 14.6685 6.36241 15.0043 6.77663 15.0043C7.19084 15.0043 7.52663 14.6685 7.52663 14.2543V11.7543ZM9.70219 9.00427C10.1164 9.00427 10.4522 9.34006 10.4522 9.75427V14.2543C10.4522 14.6685 10.1164 15.0043 9.70219 15.0043C9.28797 15.0043 8.95219 14.6685 8.95219 14.2543V9.75427C8.95219 9.34006 9.28797 9.00427 9.70219 9.00427ZM13.3742 7.75427C13.3742 7.34006 13.0384 7.00427 12.6242 7.00427C12.21 7.00427 11.8742 7.34006 11.8742 7.75427V14.2543C11.8742 14.6685 12.21 15.0043 12.6242 15.0043C13.0384 15.0043 13.3742 14.6685 13.3742 14.2543V7.75427Z"
                    fill="#00A0D1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
