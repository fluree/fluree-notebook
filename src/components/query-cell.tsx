import MonacoCell from "../monaco-cell";

import { RunButton } from "./buttons/run";
import { useState } from "react";
export interface IQueryProps {}

export const QueryCell = ({
  value,
  createCell,
  language,
  onChange,
}: {
  value: string;
  createCell?: boolean;
  language: "sparql" | "json";
  onClick?: (element: React.MouseEvent<HTMLElement>) => void;

  onChange: (value: string) => void;
}): JSX.Element => {
  const [result, setResult] = useState<string | null>(null);

  const flureePost = async (element) => {
    let contentType: string;
    let endPoint: string = "query";

    const elementValue = element.target.value;

    if (language === "sparql") {
      contentType = "application/sparql-query";
    } else {
      contentType = "application/json";
      const valueObject: object = JSON.parse(value);
      const hasGraphProperty = Object.prototype.hasOwnProperty.call(
        valueObject,
        "@graph"
      );
      if (elementValue === "create") {
        endPoint = "create";
      }
      if (hasGraphProperty && elementValue !== "create") {
        endPoint = "transact";
      }
    }

    fetch(`http://localhost:58090/fluree/${endPoint}`, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
      },
      body: value,
    })
      .then((r) => r.json())
      .then((d) => setResult(JSON.stringify(d, null, 2)))
      .catch((e) => console.log(e));
  };

  const handleChange = (newValue: string | undefined, _event: any) => {
    console.log("HANDLE CHANGE? ", newValue);
    if (typeof newValue === "string") {
      onChange(newValue);
    }
  };
  return (
    <div>
      <div className="bg-ui-surface-lite-050 rounded-md border-solid border-ui-main-400 border w-[99%] h-[250px] relative overflow-hidden">
        <MonacoCell
          value={value}
          language={language}
          changeCallback={handleChange}
        />

        <div
          className="flex flex-row absolute bg-[#ffffff] rounded-[3px] w-[203.6px] h-[28.91px] right-0 top-[2.35px] "
          style={{
            boxShadow:
              "var(--shadow-sm-box-shadow, 0px 1px 2px 0px rgba(0, 0, 0, 0.08))",
          }}
        >
          <div className="flex p-3 pt-1">
            <svg
              className="trash"
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
                d="M8.15156 1.73901C8.00303 1.73909 7.85746 1.78052 7.73114 1.85866C7.60483 1.93679 7.50276 2.04855 7.43636 2.18141L6.85716 3.33901H4.15156C3.93939 3.33901 3.73591 3.4233 3.58588 3.57333C3.43585 3.72336 3.35156 3.92684 3.35156 4.13901C3.35156 4.35119 3.43585 4.55467 3.58588 4.7047C3.73591 4.85473 3.93939 4.93901 4.15156 4.93901V12.939C4.15156 13.3634 4.32013 13.7703 4.62019 14.0704C4.92025 14.3704 5.32722 14.539 5.75156 14.539H12.1516C12.5759 14.539 12.9829 14.3704 13.2829 14.0704C13.583 13.7703 13.7516 13.3634 13.7516 12.939V4.93901C13.9637 4.93901 14.1672 4.85473 14.3172 4.7047C14.4673 4.55467 14.5516 4.35119 14.5516 4.13901C14.5516 3.92684 14.4673 3.72336 14.3172 3.57333C14.1672 3.4233 13.9637 3.33901 13.7516 3.33901H11.046L10.4668 2.18141C10.4004 2.04855 10.2983 1.93679 10.172 1.85866C10.0457 1.78052 9.90009 1.73909 9.75156 1.73901H8.15156ZM6.55156 6.53901C6.55156 6.32684 6.63585 6.12336 6.78588 5.97333C6.93591 5.8233 7.13939 5.73901 7.35156 5.73901C7.56374 5.73901 7.76722 5.8233 7.91725 5.97333C8.06728 6.12336 8.15156 6.32684 8.15156 6.53901V11.339C8.15156 11.5512 8.06728 11.7547 7.91725 11.9047C7.76722 12.0547 7.56374 12.139 7.35156 12.139C7.13939 12.139 6.93591 12.0547 6.78588 11.9047C6.63585 11.7547 6.55156 11.5512 6.55156 11.339V6.53901ZM10.5516 5.73901C10.3394 5.73901 10.1359 5.8233 9.98588 5.97333C9.83585 6.12336 9.75156 6.32684 9.75156 6.53901V11.339C9.75156 11.5512 9.83585 11.7547 9.98588 11.9047C10.1359 12.0547 10.3394 12.139 10.5516 12.139C10.7637 12.139 10.9672 12.0547 11.1172 11.9047C11.2673 11.7547 11.3516 11.5512 11.3516 11.339V6.53901C11.3516 6.32684 11.2673 6.12336 11.1172 5.97333C10.9672 5.8233 10.7637 5.73901 10.5516 5.73901Z"
                fill="#979797"
              />
            </svg>
          </div>
          <div className="flex pr-3 pt-1">
            <svg
              className="copy p1"
              style={{}}
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.31719 2.93901C6.31719 2.27627 6.85445 1.73901 7.51719 1.73901H10.6201C10.9384 1.73901 11.2436 1.86544 11.4687 2.09049L13.9657 4.58754C14.1908 4.81259 14.3172 5.11781 14.3172 5.43607V10.139C14.3172 10.8018 13.7799 11.339 13.1172 11.339H12.3172V8.63607C12.3172 7.99955 12.0643 7.3891 11.6142 6.93901L9.11719 4.44196C8.6671 3.99187 8.05665 3.73901 7.42013 3.73901H6.31719V2.93901Z"
                fill="#979797"
              />
              <path
                d="M4.31719 4.93901C3.65445 4.93901 3.11719 5.47627 3.11719 6.13901V13.339C3.11719 14.0018 3.65445 14.539 4.31719 14.539H9.91719C10.5799 14.539 11.1172 14.0018 11.1172 13.339V8.63607C11.1172 8.31781 10.9908 8.01259 10.7657 7.78754L8.26866 5.29049C8.04362 5.06544 7.73839 4.93901 7.42013 4.93901H4.31719Z"
                fill="#979797"
              />
            </svg>
          </div>
          <div className="flex pr-3 pt-1">
            <svg
              className="down"
              style={{}}
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.9151 9.47237L8.24845 14.139M8.24845 14.139L3.58179 9.47237M8.24845 14.139V2.13904"
                stroke="#979797"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex pr-3 pt-1">
            <svg
              className="up"
              style={{}}
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.81616 6.8057L8.48283 2.13904M8.48283 2.13904L13.1495 6.8057M8.48283 2.13904V14.139"
                stroke="#979797"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex pr-3 pt-1">
            <svg
              className="p1"
              style={{}}
              width="17"
              height="14"
              viewBox="0 0 17 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.90088 5.51712V3.17266M7.90088 3.17266L7.90088 0.748657M7.90088 3.17266L5.63028 3.17266M7.90088 3.17266L10.3987 3.17266M14.5596 8.06062L1.46871 8.06062C0.665383 8.06062 0.0141605 8.71185 0.0141604 9.51517L0.0141602 12.0748C0.0141601 12.8782 0.665382 13.5294 1.46871 13.5294H14.5596C15.3629 13.5294 16.0142 12.8782 16.0142 12.0748V9.51517C16.0142 8.71185 15.3629 8.06062 14.5596 8.06062Z"
                stroke="#979797"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex pr-3 pt-1">
            <svg
              className="p1"
              style={{}}
              width="17"
              height="14"
              viewBox="0 0 17 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.89282 8.76091V11.1054M8.89282 11.1054V13.5294M8.89282 11.1054H11.1634M8.89282 11.1054L6.39495 11.1054M2.23409 6.21741H15.325C16.1283 6.21741 16.7795 5.56618 16.7795 4.76286V2.2032C16.7795 1.39988 16.1283 0.748657 15.325 0.748657H2.23409C1.43076 0.748657 0.779541 1.39988 0.779541 2.2032V4.76286C0.779541 5.56618 1.43076 6.21741 2.23409 6.21741Z"
                stroke="#979797"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        {createCell ? (
          <RunButton value="create" buttonText="Create" onClick={flureePost} />
        ) : (
          <RunButton value="query" buttonText="Run" onClick={flureePost} />
        )}
      </div>

      {result && (
        <div className="py-6">
          <div className="bg-ui-surface-lite-050 rounded-md border-solid border-ui-main-400 border w-[99%] h-[250px] relative overflow-hidden">
            <MonacoCell value={result} language="json" />
          </div>
        </div>
      )}
    </div>
  );
};
