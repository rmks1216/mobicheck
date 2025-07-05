'use client';
import {useRef, useEffect} from 'react';

/**
 * checked      : true / false
 * indeterminate: true / false
 * ...props     : onChange 등 input 속성 그대로 전달
 */
export default function CheckboxIndet({checked, indeterminate, ...props}) {
  const ref = useRef(null);
  
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  
  return (
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      className="custom-checkbox dark-mode"
      {...props}
    />
  );
}