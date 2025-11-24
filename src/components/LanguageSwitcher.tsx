import * as React from 'react';

export default function LanguageSwitcher() {
  return (
    <select className="border rounded p-1 text-sm bg-white text-gray-900">
      <option value="en" className="text-gray-900">EN</option>
      <option value="zh" className="text-gray-900">中文</option>
      <option value="vi" className="text-gray-900">VN</option>
    </select>
  );
}
