import styles from './style.module.scss'

interface Props {
  /** Text to display */
  text: string
}

const Text = ({ text }: Props) => <p className={styles.text}>{text}</p>

export { Text }
