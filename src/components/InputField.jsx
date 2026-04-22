import React from 'react';

const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  icon: Icon, // Pass Lucide icon component if needed
}) => {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={name} className="label">
          {label} {required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      <div className={Icon ? 'input-with-icon' : ''}>
        {Icon && (
          <div className="input-icon-left">
            <Icon size={18} />
          </div>
        )}
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input ${error ? 'error' : ''}`}
          required={required}
        />
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default InputField;
