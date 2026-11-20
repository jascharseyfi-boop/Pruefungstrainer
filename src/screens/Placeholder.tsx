import { Header } from '../components/Header';
import { go } from '../router';

export function Placeholder({ title }: { title: string }) {
  return (
    <div class="screen">
      <Header title={title} back={() => go('start')} />
      <div class="card">
        <p>Dieser Bereich wird im nächsten Schritt gebaut.</p>
      </div>
    </div>
  );
}
