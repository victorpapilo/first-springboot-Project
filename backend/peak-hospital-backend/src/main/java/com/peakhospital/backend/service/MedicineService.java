package com.peakhospital.backend.service;

import com.peakhospital.backend.exception.ResourceNotFoundException;
import com.peakhospital.backend.model.Medicine;
import com.peakhospital.backend.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public Medicine addMedicine(Medicine medicine) {
        medicine.setId(null);
        return medicineRepository.save(medicine);
    }

    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    public Medicine getMedicineById(String id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
    }

    public Medicine restock(String id, int quantity) {
        Medicine medicine = getMedicineById(id);
        medicine.setQuantityInStock(medicine.getQuantityInStock() + quantity);
        return medicineRepository.save(medicine);
    }

    public Medicine dispense(String id, int quantity) {
        Medicine medicine = getMedicineById(id);
        if (medicine.getQuantityInStock() < quantity) {
            throw new IllegalArgumentException(
                    "Not enough stock of " + medicine.getName() + " (" + medicine.getQuantityInStock() + " left).");
        }
        medicine.setQuantityInStock(medicine.getQuantityInStock() - quantity);
        return medicineRepository.save(medicine);
    }

    public void deleteMedicine(String id) {
        Medicine medicine = getMedicineById(id);
        medicineRepository.delete(medicine);
    }
}
