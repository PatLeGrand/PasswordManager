interface Props {
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteModal({ onClose, onConfirm }: Props) {
    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-sm">
                <h3 className="font-bold text-lg">Supprimer ce service ?</h3>
                <p className="text-base-content/60 text-sm mt-2">
                    Cette action est irréversible. Le mot de passe sera définitivement supprimé.
                </p>
                <div className="modal-action">
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>Annuler</button>
                    <button className="btn btn-error btn-sm" onClick={onConfirm}>Supprimer</button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose} />
        </dialog>
    )
}