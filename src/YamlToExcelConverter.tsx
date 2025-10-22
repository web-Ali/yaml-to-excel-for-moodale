import React, { useState } from "react";
import type { ChangeEvent } from "react";
import * as XLSX from "xlsx";
import * as yaml from "js-yaml";
import { saveAs } from "file-saver";

type UserRecord = {
  fullname: string;
  password: string;
  username: string;
};

const YamlToExcelConverter: React.FC = () => {
  const [yamlData, setYamlData] = useState<UserRecord[] | null>(null);

  // Загружаем YAML-файл
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = yaml.load(content) as UserRecord[]; // массив объектов
        setYamlData(parsed);
        alert("✅ YAML успешно загружен!");
      } catch (error) {
        console.error("Ошибка при чтении YAML:", error);
        alert("❌ Ошибка при разборе YAML файла.");
      }
    };
    reader.readAsText(file);
  };

  // Конвертируем в Excel
  const handleExportToExcel = () => {
    if (!yamlData || yamlData.length === 0) {
      alert("⚠️ Сначала загрузите YAML файл!");
      return;
    }

    // Собираем данные в одну строку
    const formattedData = yamlData.map((user) => ({
      [`username,password,firstname,lastname,email`]: `${user.username},${user.password},${user.fullname.trim().split(" ")?.[1]},${user.fullname.trim().split(" ")?.[0]},${user.username}@mail.ru`,
    }));

    // Создаём таблицу
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Генерируем Excel и сохраняем
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "users.xlsx");
  };

  return (
    <div className="flex flex-col gap-4 p-6 max-w-lg mx-auto text-center">
      <h1 className="text-2xl font-bold">YAML → Excel Конвертер</h1>

      <input
        type="file"
        accept=".yml,.yaml"
        onChange={handleFileUpload}
        className="border border-gray-300 rounded p-2"
      />

      <button
        onClick={handleExportToExcel}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        Скачать Excel
      </button>

      {yamlData && (
        <pre className="bg-gray-100 text-left p-4 rounded text-sm overflow-x-auto">
          {JSON.stringify(yamlData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default YamlToExcelConverter;
