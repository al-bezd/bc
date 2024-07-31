<template>
  <input type="text" @click="showMenu" :value="valueStr" class="form-control" readonly />
  <BootstrapModalWindow v-model:seen="seen">
    <h6 class="text-center">Выберите дату</h6>
    <div class="alert alert-info">{{ valueStr }}</div>
    <div class="d-grid gap-2 space">
      <button @click="selectDay" class="btn btn-primary btn-lg btn-block text-uppercase">
        День
      </button>
      <button
        @click="selectMonth"
        class="btn btn-primary btn-lg btn-block text-uppercase"
      >
        Месяц
      </button>
      <button @click="selectYear" class="btn btn-primary btn-lg btn-block text-uppercase">
        Год
      </button>
    </div>
    <div class="btn-group" role="group">
      <button type="button" class="btn btn-warning text-uppercase fs-6" @click="cancel">
        <b>Отмена</b>
      </button>
      <button type="button" class="btn btn-primary text-uppercase fs-6" @click="accept">
        <b>Подтвердить</b>
      </button>
    </div>
  </BootstrapModalWindow>
  <BootstrapModalWindow v-model:seen="daySeen">
    <h6 class="text-center">Выберите день</h6>
    <div class="space mb-3">
      <button
        type="button"
        :class="`btn btn-${
          item == currentDay ? 'success' : 'primary'
        } btn-block text-uppercase fs-6`"
        v-for="item in 31"
        :key="item"
        @click="
          () => {
            setDay(item);
          }
        "
      >
        {{ item }}
      </button>
    </div>

    <button
      type="button"
      class="btn btn-warning btn-block text-uppercase fs-6"
      @click="
        () => {
          daySeen = false;
        }
      "
    >
      <b>НАЗАД</b>
    </button>
  </BootstrapModalWindow>
  <BootstrapModalWindow v-model:seen="monthSeen"
    ><h6 class="text-center">Выберите месяц</h6>

    <div class="space mb-3">
      <button
        type="button"
        :class="`btn btn-${
          item == currentMonth ? 'success' : 'primary'
        } btn-block text-uppercase fs-6`"
        v-for="item in 12"
        :key="item"
        @click="
          () => {
            setMonth(item);
          }
        "
      >
        {{ item }} / <span class="text-uppercase">{{ getMonthName(item) }}</span>
      </button>
    </div>

    <button
      type="button"
      class="btn btn-warning btn-block text-uppercase fs-6"
      @click="
        () => {
          monthSeen = false;
        }
      "
    >
      <b>НАЗАД</b>
    </button>
  </BootstrapModalWindow>
  <BootstrapModalWindow v-model:seen="yearSeen"
    ><h6 class="text-center">Выберите год</h6>
    <div class="space mb-3">
      <button
        type="button"
        :class="`btn btn-${
          item == currentYear ? 'success' : 'primary'
        } btn-block text-uppercase fs-6`"
        v-for="item in years"
        :key="item"
        @click="
          () => {
            setYear(item);
          }
        "
      >
        {{ item }}
      </button>
    </div>

    <button
      type="button"
      class="btn btn-warning btn-block text-uppercase fs-6"
      @click="
        () => {
          yearSeen = false;
        }
      "
    >
      <b>НАЗАД</b>
    </button>
  </BootstrapModalWindow>
</template>
<script setup lang="ts">
import BootstrapModalWindow from "@/components/widgets/BootstrapModalWindow.vue";
import { getStrDayMonth } from "@/functions/GetCurrentDateByDatePickerFormat";
import { computed, ref } from "vue";

interface IProps {
  date: string;
}
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const currentDay = currentDate.getDate();

const years = [
  currentYear - 2,
  currentYear - 1,
  currentYear,
  currentYear + 1,
  currentYear + 2,
];
const day = ref(getStrDayMonth(currentDay));
const month = ref(getStrDayMonth(currentMonth));
const year = ref(currentYear);

const props = defineProps<IProps>();
const emit = defineEmits(["update:date"]);

const seen = ref(false);
const daySeen = ref(false);
const monthSeen = ref(false);
const yearSeen = ref(false);

const modals = [daySeen, monthSeen, yearSeen];

const valueStr = computed(() => {
  return getValue();
});

function showMenu() {
  seen.value = true;
}

function selectDay() {
  modals.forEach((x) => (x.value = false));
  daySeen.value = true;
}

function selectMonth() {
  modals.forEach((x) => (x.value = false));
  monthSeen.value = true;
}

function selectYear() {
  modals.forEach((x) => (x.value = false));
  yearSeen.value = true;
}

function getValue() {
  return `${day.value}/${month.value}/${year.value}`;
}

function setDay(value: number) {
  day.value = getStrDayMonth(value);
  daySeen.value = false;
}

function setMonth(value: number) {
  month.value = getStrDayMonth(value);
  monthSeen.value = false;
}

function setYear(value: number) {
  year.value = value;
  yearSeen.value = false;
}

function getMonthName(value: number) {
  switch (value) {
    case 1:
      return "январь";
    case 2:
      return "февраль";
    case 3:
      return "март";
    case 4:
      return "апрель";
    case 5:
      return "май";
    case 6:
      return "июнь";
    case 7:
      return "июль";
    case 8:
      return "август";
    case 9:
      return "сентябрь";
    case 10:
      return "октябрь";
    case 11:
      return "ноябрь";
    case 12:
      return "декабрь";
  }
}

function accept() {
  //yyMMdd
  emit("update:date", `${year.value - 2000}${month.value}${day.value}`);
  seen.value = false;
}

function cancel() {
  seen.value = false;
}
</script>
