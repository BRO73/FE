// services/categoryService.ts
import axios from "axios";
import { CategoryResponse } from "@/types/type";

const API_URL = "http://localhost:8082/api/categories";

export const fetchCategories = () => axios.get<CategoryResponse[]>(API_URL);
