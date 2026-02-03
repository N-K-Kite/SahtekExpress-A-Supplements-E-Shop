import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  productId?: number;
  originalImageUrl?: string;

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  categories = this.productService.categories;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [''] // Optional now, as we upload file
    });
  }

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productId) {
      this.isEditMode = true;
      this.productService.getProduct(this.productId).subscribe({
        next: (product) => {
          // If category is an object, extract name for form or handle translation
          const formProduct = { ...product };
          if (product.category && typeof product.category === 'object') {
            formProduct.category = product.category.name;
          }
          this.productForm.patchValue(formProduct);
          this.originalImageUrl = product.imageUrl;
          this.imagePreview = product.imageUrl ? this.getSafeUrl(product.imageUrl) : null;
        },
        error: (err) => { }
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        // Don't patch imageUrl with Base64 if we are uploading the file via FormData
        // This keeps the payload small and consistent.
      };
      reader.readAsDataURL(file);
    }
  }

  getSafeUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl;
    return `http://localhost:9002/sahtek_db/sahtek_db/api/products/image/${imageUrl}`;
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;

      // Find the category object based on selected name
      const selectedCategoryName = formValue.category;
      const categoryObj = this.categories.find(c => c.name === selectedCategoryName);

      const product: Product = {
        ...formValue,
        stockQuantity: formValue.stock,
        brand: 'Sahtek Nutrition',
        category: categoryObj || { name: selectedCategoryName }
      };

      const fileToUpload = this.selectedFile || undefined;

      if (this.isEditMode && this.productId) {
        this.productService.updateProductWithImage(this.productId, product, fileToUpload, this.originalImageUrl).subscribe({
          next: () => this.router.navigate(['/admin/products']),
          error: (err) => { }
        });
      } else {
        this.productService.createProductWithFormData(product, fileToUpload).subscribe({
          next: () => this.router.navigate(['/admin/products']),
          error: (err) => { }
        });
      }
    }
  }
}
