import styles from './style.module.scss'

interface Props {
  text: string
}

const Text = ({ text }: Props) => <p className={styles.text}>{text}</p>

export { Text }
