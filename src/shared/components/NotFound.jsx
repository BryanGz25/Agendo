import { Link } from 'react-router-dom';
import { Button } from './ui';

export default function NotFound({ title = 'No encontramos esta página' }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-3xl font-extrabold">{title}</h1>
      <p className="text-ink-soft">
        El link puede estar mal escrito. En este prototipo las barberías se guardan solo en el
        navegador donde se crearon.
      </p>
      <Button as={Link} to="/">
        Ir al inicio
      </Button>
    </main>
  );
}
