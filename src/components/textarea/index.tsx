
import React, { TextareaHTMLAttributes } from 'react';
import styles from '../../styles/Textarea.module.css'
interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea({...rest}:TextAreaProps) {
    return <textarea className={styles.textarea} {...rest}></textarea>
}
