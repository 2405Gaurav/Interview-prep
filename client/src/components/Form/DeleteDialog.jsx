import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import React, { useState } from 'react'
import Toast from '../Toast/Toast.jsx'

const DeleteDialog = (props) => {
      const { openDeleteDialog, setOpenDeleteDialog, project, setDetails } = props;

      const [showToast, setShowToast] = useState(false);
      const [toastType, setToastType] = useState('');
      const [toastMessage, setToastMessage] = useState('');

      const handleDelete = async () => {
            try {
                  await setDetails(prev => ({
                        ...prev,
                        projects: prev.projects.filter(p => p.id !== project.id)
                  }));
                  setToastType('error');
                  setToastMessage('Project deleted succesfully!');
                  setShowToast(true);
                  setOpenDeleteDialog(false);
            } catch (error) {
                  setToastType('error');
                  setToastMessage('Failed to delete project!');
                  setShowToast(true);
                  setOpenDeleteDialog(false);
            }
      }

      return (
            <>
                  <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} className="relative z-50">
                        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                              <DialogPanel className="max-w-lg space-y-4 border bg-[#111826] text-slate-100 rounded-xl px-12 py-6">
                                    <DialogTitle className="font-bold text-lg">Delete Project</DialogTitle>
                                    <Description className="text-sm">This will permanently delete your project</Description>
                                    <p>Title: {project.title}</p>
                                    <div className="flex justify-around">
                                          <button onClick={() => setOpenDeleteDialog(false)}>Cancel</button>
                                          <button className="bg-red-700 py-2 px-3 rounded-md hover:bg-red-500 transition-all font-semibold" onClick={handleDelete}>Delete</button>
                                    </div>
                              </DialogPanel>
                        </div>
                  </Dialog>
                  {
                        showToast && (
                              <Toast
                                    toastType={toastType}
                                    toastMessage={toastMessage}
                                    setShowToast={setShowToast}
                              />
                        )
                  }
            </>
      )
}

export default DeleteDialog
