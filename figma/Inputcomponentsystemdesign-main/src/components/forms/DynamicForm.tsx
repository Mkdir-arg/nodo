import React, { useState } from 'react';
import { FormField, FormData } from '@/types/form';
import { TextInput } from './fields/TextInput';
import { TextAreaInput } from './fields/TextAreaInput';
import { SelectInput } from './fields/SelectInput';
import { MultiSelectInput } from './fields/MultiSelectInput';
import { DateInput } from './fields/DateInput';
import { DocumentUpload } from './fields/DocumentUpload';
import { RelationInput } from './fields/RelationInput';
import { CheckboxInput } from './fields/CheckboxInput';
import { RadioInput } from './fields/RadioInput';
import { SelectWithFilter } from './fields/SelectWithFilter';
import { CUITInput } from './fields/CUITInput';
import { ImageUpload } from './fields/ImageUpload';
import { InfoField } from './fields/InfoField';
import { SumField } from './fields/SumField';
import { GroupInput } from './fields/GroupInput';
import { SliderInput } from './fields/SliderInput';
import { RatingInput } from './fields/RatingInput';
import { ColorPickerInput } from './fields/ColorPickerInput';
import { TimeInput } from './fields/TimeInput';
import { CurrencyInput } from './fields/CurrencyInput';
import { URLInput } from './fields/URLInput';
import { PasswordInput } from './fields/PasswordInput';
import { CodeInput } from './fields/CodeInput';
import { TagInput } from './fields/TagInput';
import { SwitchInput } from './fields/SwitchInput';
import { HeaderUI } from './ui/HeaderUI';
import { DividerUI } from './ui/DividerUI';
import { BannerUI } from './ui/BannerUI';

interface DynamicFormProps {
  fields: FormField[];
  initialData?: FormData;
  onChange?: (data: FormData) => void;
  onSubmit?: (data: FormData) => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  initialData = {},
  onChange,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FormData>(initialData);

  const handleFieldChange = (fieldId: string, value: any) => {
    const newData = { ...formData, [fieldId]: value };
    setFormData(newData);
    onChange?.(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.id,
      label: field.label,
      required: field.required,
      disabled: field.disabled,
      error: field.error,
      size: field.size,
    };

    switch (field.type) {
      case 'text':
        return (
          <TextInput
            {...commonProps}
            type="text"
            value={formData[field.id] || field.value || ''}
            placeholder={field.placeholder}
            readonly={field.readonly}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'email':
        return (
          <TextInput
            {...commonProps}
            type="email"
            value={formData[field.id] || field.value || ''}
            placeholder={field.placeholder}
            readonly={field.readonly}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'number':
        return (
          <TextInput
            {...commonProps}
            type="number"
            value={formData[field.id] || field.value || ''}
            placeholder={field.placeholder}
            readonly={field.readonly}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'phone':
        return (
          <TextInput
            {...commonProps}
            type="tel"
            value={formData[field.id] || field.value || ''}
            placeholder={field.placeholder}
            readonly={field.readonly}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'textarea':
        return (
          <TextAreaInput
            {...commonProps}
            value={formData[field.id] || field.value || ''}
            placeholder={field.placeholder}
            readonly={field.readonly}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'select':
      case 'dropdown':
        return (
          <SelectInput
            {...commonProps}
            value={formData[field.id] || field.value || ''}
            options={field.options || []}
            placeholder={field.placeholder}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'multiselect':
        return (
          <MultiSelectInput
            {...commonProps}
            value={formData[field.id] || field.value || []}
            options={field.options || []}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'radio':
        return (
          <RadioInput
            {...commonProps}
            value={formData[field.id] || field.value || ''}
            options={field.options || []}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'select_with_filter':
        return (
          <SelectWithFilter
            {...commonProps}
            value={formData[field.id] || field.value || ''}
            options={field.options || []}
            placeholder={field.placeholder}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'date':
        return (
          <DateInput
            {...commonProps}
            value={formData[field.id] || field.value || ''}
            placeholder={field.placeholder}
            readonly={field.readonly}
            min={field.min ? String(field.min) : undefined}
            max={field.max ? String(field.max) : undefined}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'checkbox':
        return (
          <CheckboxInput
            {...commonProps}
            value={formData[field.id] || field.value || false}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'document':
        return (
          <DocumentUpload
            {...commonProps}
            value={formData[field.id] || field.value || null}
            accept={field.accept}
            maxSize={field.maxSize}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'image':
        return (
          <ImageUpload
            {...commonProps}
            value={formData[field.id] || field.value || null}
            maxSize={field.maxSize}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'cuit_razon_social':
        return (
          <CUITInput
            {...commonProps}
            cuitValue={formData[`${field.id}_cuit`] || ''}
            razonSocialValue={formData[`${field.id}_razon`] || ''}
            onChange={(cuit, razon) => {
              handleFieldChange(`${field.id}_cuit`, cuit);
              handleFieldChange(`${field.id}_razon`, razon);
            }}
          />
        );

      case 'ui:relation':
        return (
          <RelationInput
            {...commonProps}
            relationTypes={field.relationTypes || []}
            relations={formData[field.id] || field.relations || []}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'info':
        return (
          <InfoField
            id={field.id}
            label={field.label}
            value={field.value || ''}
          />
        );

      case 'sum':
        const sumValue = (field.sumFields || []).reduce((acc, fieldId) => {
          const val = parseFloat(formData[fieldId]) || 0;
          return acc + val;
        }, 0);
        return (
          <SumField
            id={field.id}
            label={field.label}
            value={sumValue}
          />
        );

      case 'group':
        const groupItems = formData[field.id] || [];
        return (
          <GroupInput
            {...commonProps}
            items={groupItems}
            groupFields={field.groupFields || []}
            maxItems={field.maxItems}
            onAdd={() => handleFieldChange(field.id, [...groupItems, {}])}
            onRemove={(index) => {
              const newItems = groupItems.filter((_: any, i: number) => i !== index);
              handleFieldChange(field.id, newItems);
            }}
            renderFields={(item, index) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {field.groupFields?.map((subField) => {
                  const itemData = formData[field.id]?.[index] || {};
                  const fieldValue = itemData[subField.id];
                  
                  return (
                    <div key={subField.id}>
                      {renderField({
                        ...subField,
                        value: fieldValue,
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          />
        );

      case 'ui:header':
        return (
          <HeaderUI
            image={field.headerImage}
            title={field.headerTitle || ''}
            description={field.headerDescription}
          />
        );

      case 'ui:divider':
        return <DividerUI label={field.label} />;

      case 'ui:banner':
        return (
          <BannerUI
            type={field.bannerType}
            message={field.bannerMessage || ''}
          />
        );

      case 'slider':
        return (
          <SliderInput
            {...commonProps}
            value={formData[field.id] || field.value || 0}
            min={field.min}
            max={field.max}
            step={field.step}
            showValue={field.showValue}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'rating':
        return (
          <RatingInput
            {...commonProps}
            value={formData[field.id] || field.value || 0}
            maxRating={field.maxRating}
            readonly={field.readonly}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'color':
        return (
          <ColorPickerInput
            {...commonProps}
            value={formData[field.id] || field.value || '#000000'}
            placeholder={field.placeholder}
            readonly={field.readonly}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'time':
        return (
          <TimeInput
            {...commonProps}
            value={formData[field.id] || field.value || ''}
            placeholder={field.placeholder}
            readonly={field.readonly}
            min={field.min ? String(field.min) : undefined}
            max={field.max ? String(field.max) : undefined}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'currency':
        return (
          <CurrencyInput
            {...commonProps}
            value={formData[field.id] || field.value || 0}
            placeholder={field.placeholder}
            readonly={field.readonly}
            currency={field.currency}
            locale={field.locale}
            min={field.min}
            max={field.max}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'url':
        return (
          <URLInput
            {...commonProps}
            value={formData[field.id] || field.value || ''}
            placeholder={field.placeholder}
            readonly={field.readonly}
            showPreview={field.showPreview}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'password':
        return (
          <PasswordInput
            {...commonProps}
            value={formData[field.id] || field.value || ''}
            placeholder={field.placeholder}
            readonly={field.readonly}
            showStrength={field.showStrength}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'code':
        return (
          <CodeInput
            {...commonProps}
            value={formData[field.id] || field.value || ''}
            placeholder={field.placeholder}
            readonly={field.readonly}
            language={field.language}
            showLineNumbers={field.showLineNumbers}
            minRows={field.minRows}
            maxRows={field.maxRows}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'tags':
        return (
          <TagInput
            {...commonProps}
            value={formData[field.id] || field.value || []}
            placeholder={field.placeholder}
            readonly={field.readonly}
            maxTags={field.maxTags}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      case 'switch':
        return (
          <SwitchInput
            {...commonProps}
            value={formData[field.id] || field.value || false}
            description={field.description}
            onChange={(value) => handleFieldChange(field.id, value)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.id}>
          {renderField(field)}
        </div>
      ))}
    </form>
  );
};