import AdminNavbar from './AdminNavbar.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { Skeleton, Toast } from '../../components/ui/Feedback.jsx';

/* Shared shell for the five admin list views: same chrome, same heading
   position, same table treatment, same loading and empty handling — so moving
   between them never feels like moving between different products. */
export default function AdminPage({
  title,
  description,
  columns,
  rows,
  loading,
  renderRow,
  emptyText,
  toast,
  onToastDismiss,
  toastTone = 'success',
}) {
  return (
    <div className="page-admin">
      <a className="pf-skip-link" href="#main">
        Skip to table
      </a>
      <AdminNavbar />

      <main id="main" className="pf-below-appbar">
        <div className="pf-container admin">
          <header className="pf-page-head">
            <div>
              <h1 className="pf-page-head__title">{title}</h1>
              {description && <p className="pf-page-head__sub">{description}</p>}
            </div>
            {!loading && (
              <p className="pf-caption" aria-live="polite">
                {rows.length} {rows.length === 1 ? 'row' : 'rows'}
              </p>
            )}
          </header>

          <div className="pf-table-wrap">
            <table className="pf-table">
              <caption className="pf-sr-only">{title}</caption>
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }, (_, i) => (
                    <tr key={i} aria-hidden="true">
                      {columns.map((c) => (
                        <td key={c}>
                          <Skeleton height="1rem" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : rows.length ? (
                  rows.map(renderRow)
                ) : (
                  <tr className="pf-table__empty">
                    <td colSpan={columns.length}>{emptyText}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="pf-caption admin__scroll-hint">
            <Icon name="chevronRight" size={13} /> Scroll the table sideways to see every column.
          </p>
        </div>
      </main>

      <Toast message={toast} tone={toastTone} onDismiss={onToastDismiss} />
    </div>
  );
}
