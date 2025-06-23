"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import { useAuth } from "@/context/AuthContext";
import {
  CreatePackModal,
  DeletePackModal,
  ManagePacksHeader,
  PacksGrid,
} from "@/components/packs";
import { fetchPacks, createPack, updatePack, deletePack } from "@/utils/api";

export default function ManagePacks() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPack, setEditingPack] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPackData, setNewPackData] = useState({ name: "", cost: "" });
  const router = useRouter();
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();

  // Fetch packs data
  useEffect(() => {
    if (!authLoading && (!isLoggedIn || !isAdmin)) {
      router.push("/");
      return;
    }
    if (isLoggedIn && isAdmin) {
      const loadData = () => {
        fetchPacks()
          .then((response) => {
            if (!response.ok) throw new Error("Failed to fetch packs");
            return response.json();
          })
          .then((data) => setPacks(data))
          .catch((err) => {
            console.error("Error fetching packs:", err);
            setError(err.message);
          })
          .finally(() => setLoading(false));
      };
      loadData();
    }
  }, [isLoggedIn, isAdmin, authLoading, router]);

  const handleCreatePack = () => {
    createPack(newPackData)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to create pack");
        return response.json();
      })
      .then((data) => {
        setPacks([data.pack, ...packs]);
        setShowCreateModal(false);
        setNewPackData({ name: "", cost: "" });
      })
      .catch((err) => {
        console.error("Error creating pack:", err);
        setError(err.message);
      });
  };

  const handleEdit = (pack) => {
    setEditingPack(pack);
    setEditFormData({
      name: pack.name,
      cost: pack.cost,
    });
  };

  const handleCancelEdit = () => {
    setEditingPack(null);
    setEditFormData(null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingPack) return;
    updatePack(editingPack.id, editFormData)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to update pack");
        return response.json();
      })
      .then(() => {
        setPacks(
          packs.map((pack) =>
            pack.id === editingPack.id ? { ...pack, ...editFormData } : pack
          )
        );
        setEditingPack(null);
        setEditFormData(null);
      })
      .catch((err) => {
        console.error("Error updating pack:", err);
        setError(err.message);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingPack) {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewPackData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDelete = (pack) => {
    setSelectedPack(pack);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedPack) return;

    deletePack(selectedPack.id)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to delete pack");
        setPacks(packs.filter((p) => p.id !== selectedPack.id));
        setShowDeleteModal(false);
        setSelectedPack(null);
      })
      .catch((err) => {
        console.error("Error deleting pack:", err);
        setError(err.message);
      });
  };

  const handleManageCards = (packId) => {
    router.push(`/admin/pack-cards/${packId}`);
  };

  if (authLoading || loading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!isLoggedIn || !isAdmin) {
    return <div className={styles.container}>Unauthorized</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles.withNavbar}`}>
      <div className={styles.content}>
        <ManagePacksHeader onCreatePack={() => setShowCreateModal(true)} />
        <PacksGrid
          packs={packs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManageCards={handleManageCards}
          onSave={handleEditSubmit}
          onCancel={handleCancelEdit}
          isEditing={editingPack}
          editFormData={editFormData}
          onInputChange={handleInputChange}
        />
      </div>

      <CreatePackModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreatePack}
        packData={newPackData}
        onInputChange={handleInputChange}
      />

      <DeletePackModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPack(null);
        }}
        onConfirm={handleConfirmDelete}
        packName={selectedPack?.name}
      />
    </div>
  );
}
