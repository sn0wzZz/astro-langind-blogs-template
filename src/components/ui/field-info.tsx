import type { AnyFieldApi } from '@tanstack/react-form';

export default function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <p className='body-12-regular text-destructive-foreground absolute -bottom-5'>
          {field.state.meta.errors.join(', ')}
        </p>
      ) : null}
      {field.state.meta.isValidating ? <p className='body-12-regular text-muted-foreground absolute -bottom-5'>Валидиране...</p> : null}
    </>
  )
}